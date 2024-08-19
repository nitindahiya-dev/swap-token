// pages/api/swap.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { fromTokenMint, toTokenMint, amount, publicKey } = req.body;

    try {
      if (!fromTokenMint || !toTokenMint || !amount || !publicKey) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const connection = new Connection(clusterApiUrl('devnet'));

      const fromTokenMintAddress = new PublicKey(fromTokenMint);
      const toTokenMintAddress = new PublicKey(toTokenMint);
      const userPublicKey = new PublicKey(publicKey);

      // Get associated token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(fromTokenMintAddress, userPublicKey);
      const toTokenAccount = await getAssociatedTokenAddress(toTokenMintAddress, userPublicKey);

      // Create associated token accounts if they do not exist
      const transaction = new Transaction();
      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          userPublicKey,
          amount,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Send transaction
      const signature = await connection.sendTransaction(transaction, [], { skipPreflight: false, preflightCommitment: "confirmed" });
      await connection.confirmTransaction(signature);

      res.status(200).json({ message: 'Swap successful!', signature });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: 'Swap failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
