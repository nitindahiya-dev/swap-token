const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const { TokenSwap, TOKEN_SWAP_PROGRAM_ID } = require('@solana/spl-token-swap');
const { PublicKey } = require('@solana/web3.js');

(async () => {
  try {
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
    console.log('Connected to Solana Devnet.');

    const payer = Keypair.generate();
    console.log('Generated payer keypair.');

    const airdropAmount = 0.1 * LAMPORTS_PER_SOL;
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, airdropAmount);
    console.log(`Requested ${airdropAmount / LAMPORTS_PER_SOL} SOL airdrop.`);
    await connection.confirmTransaction(airdropSignature);
    console.log('Airdrop confirmed.');

    const tokenAMint = await createMint(connection, payer, payer.publicKey, null, 9);
    const tokenBMint = await createMint(connection, payer, payer.publicKey, null, 9);
    console.log(`Created Token A mint: ${tokenAMint.toBase58()}`);
    console.log(`Created Token B mint: ${tokenBMint.toBase58()}`);

    const tokenAAccountInfo = await getOrCreateAssociatedTokenAccount(connection, payer, tokenAMint, payer.publicKey);
    const tokenBAccountInfo = await getOrCreateAssociatedTokenAccount(connection, payer, tokenBMint, payer.publicKey);
    console.log(`Token A account: ${tokenAAccountInfo.address.toBase58()}`);
    console.log(`Token B account: ${tokenBAccountInfo.address.toBase58()}`);

    await mintTo(connection, payer, tokenAMint, tokenAAccountInfo.address, payer.publicKey, 10000000);
    await mintTo(connection, payer, tokenBMint, tokenBAccountInfo.address, payer.publicKey, 10000000);
    console.log('Minted tokens to the associated token accounts.');

    // Check if the TokenSwap.createTokenSwap is throwing an error due to missing parameters or compatibility issues
    // Skipping TokenSwap setup to focus on identifying if it's the cause

    console.log('Setup completed successfully.');
  } catch (error) {
    console.error('An error occurred:', error.message);
    console.error('Stack trace:', error.stack);
  }
})();
