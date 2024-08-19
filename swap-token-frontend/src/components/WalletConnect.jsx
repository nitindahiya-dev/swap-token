"use client"

import { useState } from 'react';
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const WalletConnect = ({ setWalletAddress }) => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);

  const connectWallet = async () => {
    const adapter = new PhantomWalletAdapter();
    await adapter.connect();
    setWallet(adapter);
    setWalletAddress(adapter.publicKey.toString());

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const balance = await connection.getBalance(adapter.publicKey);
    setBalance(balance / LAMPORTS_PER_SOL);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md">
      {wallet ? (
        <div>
          <p className="text-lg font-bold text-black">Connected: {wallet.publicKey.toString()}</p>
          <p className="text-lg text-black">Balance: {balance} SOL</p>
        </div>
      ) : (
        <button
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
