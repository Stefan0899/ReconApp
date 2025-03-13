require("dotenv").config();
const { ethers } = require("ethers");

// ✅ Constants
const contractAddress = "0xB16103De3B577C8384157A7B15660bA97469DBA8"; // ✅ Replace with deployed contract address
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

// ✅ Function to pay energy fees
async function payEnergyFees(userAddress, privateKey) {
    try {
        // ✅ ABI for interacting with the contract
        const contractABI = [
            "function userProvider(address user) public view returns (address)",
            "function userDistributor(address user) public view returns (address)",
            "function userTransmittor(address user) public view returns (address)",
            "function userGenerator(address user) public view returns (address)",
            "function userFees(address user) public view returns (uint256 totalBill, uint256 distributionFee, uint256 transmissionFee, uint256 providerFee, uint256 generatorFee)",
            "function payEnergyFees() public payable"
        ];

        // ✅ Connect user wallet
        const userWallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(contractAddress, contractABI, userWallet);

        console.log(`🔹 Using User Wallet: ${userWallet.address}`);

        console.log("🔹 Fetching ETH balances before transaction...");

        // ✅ Fetch the user's outstanding bill and fee breakdown
        const [distributionFee, transmissionFee, providerFee, generatorFee, totalBill] = await contract.userFees(userWallet.address);
        // ✅ Print all fee values
        console.log(`💰 Distribution Fee: ${ethers.formatEther(distributionFee)} ETH`);
        console.log(`💰 Transmission Fee: ${ethers.formatEther(transmissionFee)} ETH`);
        console.log(`💰 Provider Fee: ${ethers.formatEther(providerFee)} ETH`);
        console.log(`💰 Generator Fee: ${ethers.formatEther(generatorFee)} ETH`);
        console.log(`💰 Total Bill: ${ethers.formatEther(totalBill)} ETH`);

        console.log(`📜 Total Bill to Pay: ${ethers.formatEther(totalBill)} ETH`);

        // // ✅ Check if the user has enough balance to pay
        // if (userBalanceBefore < totalBill) {
        //     console.error("❌ Insufficient funds to pay the bill.");
        //     return { success: false, message: "Insufficient funds." };
        // }

        console.log("🔹 Paying energy fees...");

        // ✅ Pay the energy fees
        const tx = await contract.payEnergyFees({ value: totalBill });
        await tx.wait(); // Wait for transaction confirmation

        console.log("✅ Energy fees paid successfully!");

        // ✅ Convert values to ETH format for clarity
        const totalPayment = ethers.formatEther(totalBill);
        const distributorPayment = ethers.formatEther(distributionFee);
        const providerPayment = ethers.formatEther(providerFee);
        const transmittorPayment = ethers.formatEther(transmissionFee);
        const generatorPayment = ethers.formatEther(generatorFee);

        return {
            success: true,
            message: "Energy fees paid successfully!",
            transactionHash: tx.hash,
            totalPayment,
            distributorPayment,
            providerPayment,
            transmittorPayment,
            generatorPayment,
        };

    } catch (error) {
        console.error("❌ Error paying energy fees:", error.reason || error.message);
        return { success: false, message: "Payment failed." };
    }
}

module.exports = { payEnergyFees };


