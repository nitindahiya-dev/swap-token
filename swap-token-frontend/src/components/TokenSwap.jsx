"use client"

import { useState } from 'react';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';

const TokenSwap = ({ walletAddress }) => {
  const [logs, setLogs] = useState([]);

  const log = (message) => setLogs((prevLogs) => [...prevLogs, message]);

  const swapTokens = async () => {
    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      log('Connected to Solana Devnet.');

      const payer = Keypair.generate();
      log('Generated payer keypair.');

      const airdropSignature = await connection.requestAirdrop(payer.publicKey, 0.1 * LAMPORTS_PER_SOL);
      log('Requested SOL airdrop.');
      await connection.confirmTransaction(airdropSignature);
      log('Airdrop confirmed.');

      const tokenAMint = await createMint(connection, payer, payer.publicKey, null, 9);
      const tokenBMint = await createMint(connection, payer, payer.publicKey, null, 9);
      log(`Created Token A mint: ${tokenAMint.toBase58()}`);
      log(`Created Token B mint: ${tokenBMint.toBase58()}`);

      const tokenAAccountInfo = await getOrCreateAssociatedTokenAccount(connection, payer, tokenAMint, payer.publicKey);
      const tokenBAccountInfo = await getOrCreateAssociatedTokenAccount(connection, payer, tokenBMint, payer.publicKey);
      log(`Token A account: ${tokenAAccountInfo.address.toBase58()}`);
      log(`Token B account: ${tokenBAccountInfo.address.toBase58()}`);

      await mintTo(connection, payer, tokenAMint, tokenAAccountInfo.address, payer.publicKey, 10000000);
      await mintTo(connection, payer, tokenBMint, tokenBAccountInfo.address, payer.publicKey, 10000000);
      log('Minted tokens to the associated token accounts.');

      // Implement token swap logic here

      log('Token swap completed.');
    } catch (error) {
      log(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <button
        className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
        onClick={swapTokens}
      >
        Swap Tokens
      </button>
      <div className="mt-4">
        {logs.map((log, index) => (
          <p key={index} className="text-sm text-gray-700">
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};

export default TokenSwap;
