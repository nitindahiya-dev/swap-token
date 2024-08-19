const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

(async () => {
  try {
    // Establish connection to the local Solana test validator
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
    console.log('Connected to Solana Devnet.');

    // Generate a new keypair for the payer
    const payer = Keypair.generate();
    console.log('Generated payer keypair.');

    // Request airdrop to fund the payer account
    const airdropAmount = 0.1 * LAMPORTS_PER_SOL;
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, airdropAmount);
    console.log(`Requested ${airdropAmount / LAMPORTS_PER_SOL} SOL airdrop.`);
    
    // Confirm the airdrop transaction
    await connection.confirmTransaction(airdropSignature);
    console.log('Airdrop confirmed.');

    // Create a new mint for the token
    const mint = await createMint(connection, payer, payer.publicKey, null, 9);
    console.log(`Created new mint with address: ${mint.toBase58()}`);

    // Create or get the associated token account for the mint
    const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
    console.log(`Token account created with address: ${tokenAccount.address.toBase58()}`);

    // Mint tokens to the associated token account
    const mintAmount = 10000000; // Amount to mint
    await mintTo(connection, payer, mint, tokenAccount.address, payer.publicKey, mintAmount);
    console.log(`Minted ${mintAmount} tokens to the token account.`);

    console.log('Minimal test case completed successfully!');
  } catch (error) {
    console.error('An error occurred:', error.message);
    console.error('Stack trace:', error.stack);
  }
})();
