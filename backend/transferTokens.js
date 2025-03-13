require("dotenv").config();
const { ethers } = require("ethers");
const { response } = require("express");

// ✅ Configuration
const factoryAddress = "0x15381B00823186EAA183a0395aF91CeF90aB5905"; // Replace with actual factory contract address
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY; // ✅ Store sender's private key in .env file
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const wallet = new ethers.Wallet(ownerPrivateKey, provider);

// ✅ Function to generate a random number within a given range
function getRandomAmount(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ✅ Main function to transfer tokens
async function transferTokens(userAddress) {
    try {
        // ✅ Get the factory contract instance
        const factory = new ethers.Contract(factoryAddress, ["function tokenEp() view returns (address)", "function tokenEs() view returns (address)", "function tokenEo() view returns (address)"], wallet);
        
        // ✅ Fetch deployed token addresses
        const tokenEpAddress = await factory.tokenEp();
        const tokenEsAddress = await factory.tokenEs();
        const tokenEoAddress = await factory.tokenEo();

        // ✅ Get token contract instances
        const tokenAbi = ["function transfer(address to, uint256 amount) public returns (bool)"];
        const tokenEp = new ethers.Contract(tokenEpAddress, tokenAbi, wallet);
        const tokenEs = new ethers.Contract(tokenEsAddress, tokenAbi, wallet);
        const tokenEo = new ethers.Contract(tokenEoAddress, tokenAbi, wallet);

        // ✅ Generate random amounts for each token
        const amountEp = getRandomAmount(4000, 8000);
        const amountEs = getRandomAmount(8000, 12000);
        const amountEo = getRandomAmount(8000, 12000);

        console.log(`🔹 Transferring ${amountEp} Ep tokens...`);
        const tx1 = await tokenEp.transfer(userAddress, ethers.parseUnits(amountEp.toString(), "ether"));
        await tx1.wait();
        console.log(`✅ Ep Transfer Successful! TX: ${tx1.hash}`);

        console.log(`🔹 Transferring ${amountEs} Es tokens...`);
        const tx2 = await tokenEs.transfer(userAddress, ethers.parseUnits(amountEs.toString(), "ether"));
        await tx2.wait();
        console.log(`✅ Es Transfer Successful! TX: ${tx2.hash}`);

        console.log(`🔹 Transferring ${amountEo} Eo tokens...`);
        const tx3 = await tokenEo.transfer(userAddress, ethers.parseUnits(amountEo.toString(), "ether"));
        await tx3.wait();
        console.log(`✅ Eo Transfer Successful! TX: ${tx3.hash}`);

        console.log("🚀 All token transfers completed successfully!");

        const responseData = {
            PeakTokens : amountEp,
            EpTxHash : tx1.hash,
            StdTokens : amountEs,
            EsTxHash : tx2.hash,
            OffTokens : amountEo,
            EoTxHash : tx3.hash,
        }
        return responseData;
    } catch (error) {
        console.error("❌ Error transferring tokens:", error);
    }
}

// ✅ Run the function
module.exports = { transferTokens };
