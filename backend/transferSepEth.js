require("dotenv").config();
const { ethers } = require("ethers");

// ✅ Set up connection to Sepolia via Alchemy
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

// ✅ Load the owner's private key from `.env`
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;

// ✅ Function to send Sepolia ETH with dynamic amount
async function sendSepoliaETH(userAddress, amount) {
    try {
        if (!userAddress || !amount) {
            throw new Error("Missing user address or amount.");
        }

        console.log(`🔹 Sending ${amount} SepoliaETH to ${userAddress}...`);

        // ✅ Create wallet instance using the owner's private key
        const wallet = new ethers.Wallet(ownerPrivateKey, provider);

        // ✅ Convert amount to Wei
        const amountWei = ethers.parseEther(amount.toString()); // Ensure `amount` is a string

        // ✅ Send the ETH transaction
        const tx = await wallet.sendTransaction({
            to: userAddress, // ✅ User address is the recipient
            value: amountWei, // Amount in Wei
        });

        console.log("✅ Transaction sent! Waiting for confirmation...");
        await tx.wait();

        console.log(`✅ Transaction successful! Hash: ${tx.hash}`);

        return {
            success: true,
            transactionHash: tx.hash,
            from: wallet.address,
            to: userAddress,
            amount: amount // ✅ Return the sent amount
        };

    } catch (error) {
        console.error("❌ Error sending SepoliaETH:", error.message);
        return { success: false, error: error.message };
    }
}

// ✅ Export function for use in `server.js`
module.exports = { sendSepoliaETH };

