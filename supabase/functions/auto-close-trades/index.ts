
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting automatic trade closure check...')

    // Function to fetch fresh price from Binance API
    const fetchFreshPrice = async (symbol: string): Promise<number> => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`)
        if (!response.ok) {
          throw new Error('Failed to fetch price')
        }
        const data = await response.json()
        console.log(`Fresh price for ${symbol}: ${data.price}`)
        return parseFloat(data.price)
      } catch (error) {  
        console.error('Error fetching fresh price:', error)
        throw error
      }
    }

    // Function to get coin settings from database
    const getCoinSettings = async (symbol: string) => {
      try {
        const { data, error } = await supabase
          .from('coins')
          .select('*')
          .eq('symbol', symbol)
          .eq('status', 'active')
          .single()

        if (error) {
          console.error(`Error fetching coin settings for ${symbol}:`, error)
          return null
        }

        return data
      } catch (error) {
        console.error(`Error getting coin settings for ${symbol}:`, error)
        return null
      }
    }

    // Function to update user balance
    const updateUserBalance = async (userId: string, amount: number) => {
      try {
        const { error } = await supabase.rpc('add_user_balance', {
          user_id: userId,
          amount: amount
        })

        if (error) {
          console.error('Error updating balance:', error)
        } else {
          console.log(`Balance updated for user ${userId}: +${amount}`)
        }
      } catch (error) {
        console.error('Error updating balance:', error)
      }
    }

    // Get all running AND pending trades that have expired
    const { data: expiredTrades, error } = await supabase
      .from('trade_transactions')
      .select('*')
      .in('status', ['running', 'pending'])
      .lt('return_time', new Date().toISOString())

    if (error) {
      console.error('Error fetching expired trades:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch expired trades' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!expiredTrades || expiredTrades.length === 0) {
      console.log('No expired trades found')
      return new Response(
        JSON.stringify({ message: 'No expired trades to process', processed: 0 }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${expiredTrades.length} expired trades to process`)
    let processedCount = 0

    // Process each expired trade
    for (const trade of expiredTrades) {
      try {
        console.log(`Processing expired trade ${trade.id} for ${trade.symbol} with status ${trade.status}`)
        
        // Get coin settings from database - REQUIRED
        const coinSettings = await getCoinSettings(trade.symbol)
        if (!coinSettings) {
          console.error(`No coin settings found for ${trade.symbol}, skipping trade ${trade.id}`)
          continue
        }

        // Ensure we have valid profit/loss percentage from database
        if (coinSettings.profit_loss === null || coinSettings.profit_loss === undefined) {
          console.error(`No profit_loss percentage set for ${trade.symbol}, skipping trade ${trade.id}`)
          continue
        }

        console.log(`Coin settings for ${trade.symbol}:`, {
          profit_loss: coinSettings.profit_loss
        })

        const freshClosePrice = await fetchFreshPrice(trade.symbol)
        const closeTime = new Date()
        
        // Use real market data to determine win/loss
        const openPrice = trade.buy_price || trade.price
        const closePrice = freshClosePrice
        
        let isWin = false
        let result: 'WIN' | 'LOSE'
        
        // Determine win/loss based on trade type and actual price movement
        if (trade.trade_type === 'BUY') {
          // BUY trade wins if price goes up
          isWin = closePrice > openPrice
        } else {
          // SELL trade wins if price goes down
          isWin = closePrice < openPrice
        }
        
        result = isWin ? 'WIN' : 'LOSE'
        let profit = 0
        let winLoss: 'win' | 'lose' = isWin ? 'win' : 'lose'
        let tradeStatus: 'PROFIT' | 'LOSS' = isWin ? 'PROFIT' : 'LOSS'

        const profitPercentage = coinSettings.profit_loss // Use exact value from database

        console.log(`Trade ${trade.id} real market analysis:`, {
          symbol: trade.symbol,
          trade_type: trade.trade_type,
          openPrice: openPrice,
          closePrice: closePrice,
          priceChange: closePrice - openPrice,
          priceChangePercent: ((closePrice - openPrice) / openPrice * 100).toFixed(2) + '%',
          isWin: isWin,
          profitPercentage: profitPercentage
        })

        // Calculate profit/loss based on percentage from database
        if (isWin) {
          // Win: User gets back original amount + profit percentage
          profit = trade.amount * (profitPercentage / 100)
        } else {
          // Loss: User loses the profit percentage amount
          profit = -(trade.amount * (profitPercentage / 100))
        }

        console.log(`Trade ${trade.id} result: ${result}, Open: ${openPrice}, Close: ${closePrice}, Profit/Loss: ${profit}`)

        // Update trade in database to complete
        const { error: updateError } = await supabase
          .from('trade_transactions')
          .update({
            status: 'complete',
            trade_close_price: freshClosePrice,
            close_price: freshClosePrice,
            win_loss: winLoss,
            trade_status: tradeStatus,
            profit_loss: profit,
            closing_time: closeTime.toISOString()
          })
          .eq('id', trade.id)
          .in('status', ['running', 'pending']) // Only update if still running or pending

        if (updateError) {
          console.error(`Failed to update trade ${trade.id}:`, updateError)
        } else {
          // Update user balance based on result
          if (result === 'WIN') {
            // Add original amount + profit
            await updateUserBalance(trade.user_id, trade.amount + profit)
            console.log(`User won! Added ${trade.amount + profit} to balance`)
          } else {
            // Return original amount minus loss percentage
            const returnAmount = trade.amount + profit // profit is negative for losses
            await updateUserBalance(trade.user_id, returnAmount)
            console.log(`User lost ${Math.abs(profit)} (${profitPercentage}%) but got ${returnAmount} back`)
          }
          console.log(`Trade ${trade.id} successfully closed with result: ${result}`)
          processedCount++
        }
      } catch (error) {
        console.error(`Failed to process trade ${trade.id}:`, error)
      }
    }

    console.log(`Processed ${processedCount} out of ${expiredTrades.length} expired trades`)

    return new Response(
      JSON.stringify({ 
        message: 'Trades processed successfully', 
        processed: processedCount,
        total: expiredTrades.length 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in auto-close-trades function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
