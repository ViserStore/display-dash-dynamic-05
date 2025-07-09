// src/contexts/AnimationContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

// --- 1. Define the animation path types ---
interface AnimationPaths {
  aiTrading: string;
  referral: string;
  nft: string;
  dailyCheckin: string;
}

interface AnimationContextType {
  animations: AnimationPaths;
  isLoaded: boolean;
}

// --- 2. Create the context ---
const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

// --- 3. Create the provider ---
export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animations, setAnimations] = useState<AnimationPaths>({
    aiTrading: "/animation/vTb2yXxIi0.json",
    referral: "/animation/dwYo1sm1sX.json",
    nft: "/animation/CNrfh2sUhL.json",
    dailyCheckin: "/animation/wUYv6sRuZl.json",
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate preloading or fetch delay if needed
    const preload = async () => {
      // Optionally add fetch preloading hzzzzere
      setIsLoaded(true);
    };

    preload();
  }, []);

  return (
    <AnimationContext.Provider value={{ animations, isLoaded }}>
      {children}
    </AnimationContext.Provider>
  );
};

// --- 4. Create a custom hook to use the context ---
export const useAnimations = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimations must be used within an AnimationProvider");
  }
  return context;
};
