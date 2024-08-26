"use client"
import { useState } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

export default function Home() {
  const [fromToken, setFromToken] = useState<string>("ETH");
  const [toToken, setToToken] = useState<string>("DAI");
  const [wallet, setWallet] = useState<PhantomWalletAdapter | null>(null);
  const [balance, setBalance] = useState<number>(0);

  const connectWallet = async (): Promise<void> => {
    try {
      const wallet = new PhantomWalletAdapter();
      await wallet.connect();
      setWallet(wallet);
      const connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet));

      if (wallet.publicKey) {
        const balance = await connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const swapTokens = async (): Promise<void> => {
    if (!wallet || !wallet.publicKey) return;
  
    try {
      const response = await fetch('/api/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromTokenMint: "9xQntM2xPgg5cxk6V5z5Qv5hQjyKxJ7YF2dm9os66DW4",
          toTokenMint: "7Uwm8v3KyxD8EcfJzEDALHcQ9taG4a81hLrsdPHkR5fJ",
          amount: 1000000, // Amount in smallest unit
          publicKey: wallet.publicKey.toBase58(),
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("Swap successful:", result);
      } else {
        const errorText = await response.text();
        console.error("Swap failed:", errorText);
      }
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };
  
  return (
    <div className="flex flex-col gap-10 justify-center items-center h-screen">
      <h1 className="text-5xl font-bold">Swap Token</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-4 text-lg font-semibold text-center text-black truncate">
          Connected: {wallet?.publicKey?.toBase58() || "Not Connected"}
        </div>
        <div className="mb-4 text-center text-black">Balance: {balance.toFixed(2)} SOL</div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-black">From</label>
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-black"
            >
              <option value="ETH">ETH</option>
              <option value="SOL">SOL</option>
              <option value="BTC">BTC</option>
            </select>
          </div>

          <div className="flex justify-center my-2">
            <button onClick={swapTokens} className="text-black hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6 rotate-90"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l-7-7 7-7m7 14l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-black">To</label>
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-black"
            >
              <option value="DAI">DAI</option>
              <option value="USDC">USDC</option>
              <option value="SOL">SOL</option>
            </select>
          </div>
        </div>

        <button
          onClick={connectWallet}
          className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {wallet ? "Connected" : "Connect Wallet"}
        </button>

        <button
          onClick={swapTokens}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Swap Tokens
        </button>
      </div>
    </div>
  );
}
