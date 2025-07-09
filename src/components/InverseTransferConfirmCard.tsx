
import React from 'react';

interface ReceiverData {
  pay_id: string;
  username: string;
}

interface InverseTransferConfirmCardProps {
  receiverData: ReceiverData;
  transferAmount: string;
  receiveAmount: number;
  charge: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const InverseTransferConfirmCard: React.FC<InverseTransferConfirmCardProps> = ({
  receiverData,
  transferAmount,
  receiveAmount,
  charge,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  return (
    <div className="bg-gray-800/60 backdrop-blur-md rounded-lg p-4 shadow-lg border border-gray-600/50 max-w-[480px] mx-auto relative">
      {/* Close Button */}
      <button 
        className="absolute right-3 top-3 text-gray-300 hover:text-white text-lg hover:text-xl transition-all"
        onClick={onCancel}
        disabled={isLoading}
        type="button"
      >
        <i className="fi fi-sr-cross-circle"></i>
      </button>

      {/* Title */}
      <h3 className="font-bold text-center text-white text-sm -mt-1 mb-3">
        Confirm Transfer
      </h3>

      {/* Send To Section */}
      <div className="mt-3">
        <h1 className="text-xs text-gray-200 font-medium">Send To</h1>
        <div className="bg-gray-700/40 p-2 rounded border border-gray-600/50 mt-2">
          <div className="flex gap-3 items-center">
            <img 
              className="w-9 h-9" 
              src="data:image/svg+xml,%3csvg%20fill='%23ffffff'%20viewBox='0%200%2024%2024'%20id='user-circle-2'%20data-name='Flat%20Color'%20xmlns='http://www.w3.org/2000/svg'%20class='icon%20flat-color'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3c/g%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3ccircle%20id='primary'%20cx='12'%20cy='12'%20r='10'%20style='fill:%20%234a5568;'%3e%3c/circle%3e%3cpath%20id='secondary'%20d='M19.37,17.88a8,8,0,0,0-3.43-3.83,5,5,0,1,0-7.88,0,8,8,0,0,0-3.43,3.83A1,1,0,0,0,4.83,19a10,10,0,0,0,14.24.1l.09-.09A1,1,0,0,0,19.37,17.88Z'%20style='fill:%20%2368d391;'%3e%3c/path%3e%3c/g%3e%3c/svg%3e" 
              alt="" 
            />
            <div>
              <h1 className="font-bold text-white text-sm">
                {receiverData.pay_id} (PAY ID)
              </h1>
              <h1 className="font-normal text-gray-300 text-sm">
                Username: {receiverData.username}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Section */}
      <div className="mt-5">
        <h1 className="text-xs text-gray-200 font-medium">Amount</h1>
        <div className="bg-gray-700/40 p-2 rounded border border-gray-600/50 mt-2">
          <div className="flex gap-3 items-center">
            <h1 className="flex-auto font-normal text-gray-300 text-sm">
              Payee Receives
            </h1>
            <div className="text-end">
              <h1 className="font-bold text-white text-sm">
                {receiveAmount.toFixed(2)} USDT
              </h1>
              <h1 className="font-normal text-gray-300 text-sm">
                ≈ ({transferAmount} - {charge.toFixed(2)})$
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Section */}
      <div className="bg-orange-900/30 border border-orange-600/50 p-2 rounded mt-12">
        <h1 className="text-orange-200 text-xs">
          Please ensure payee and amount information is correct. No refunds are supported.
        </h1>
      </div>

      {/* Confirm Button */}
      <div className="mt-3">
        <button 
          type="button" 
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white w-full p-2 rounded text-sm font-semibold h-10 disabled:opacity-50 transition-all"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </div>
  );
};

export default InverseTransferConfirmCard;
