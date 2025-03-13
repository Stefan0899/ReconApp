require("dotenv").config();
const { ethers } = require("ethers");

// ✅ Set up connection to Sepolia via Alchemy
const contractAddress = "0xB16103De3B577C8384157A7B15660bA97469DBA8"; // ✅ Replace with deployed contract address
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const providerWallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY, provider);

// ✅ Contract ABI (Only including the relevant function)
const contractABI = [
    "function viewAllUserData(address user) public view returns ("
    + "uint32,uint32,uint32," // Total Usage (Not Used)
    + "uint32,uint32,uint32," // Distributor Usage (Not Used)
    + "uint32,uint32,uint32," // Token Balances (Not Used)
    + "uint256,uint256,uint256,uint256,uint256," // Fees (Not Used)
    + "uint32,uint32,uint32,uint32," // Distributor Tariffs
    + "uint32,uint32,uint32,uint32," // Transmittor Tariffs
    + "uint32,uint32,uint32,uint32)" // Generator Tariffs
];

// ✅ Function to Fetch User Tariffs
async function getUserTariffs(userAddress) {
    try {
        // ✅ Connect to Contract
        const contract = new ethers.Contract(contractAddress, contractABI, providerWallet);

        console.log(`🔹 Fetching tariff data for user: ${userAddress}`);

        // ✅ Fetch Data from Smart Contract
        let data = await contract.viewAllUserData(userAddress);

        const userTariffs = {
            distributorTariffs: {
                peak: Number(data[14] ?? 0),
                standard: Number(data[15] ?? 0),
                offpeak: Number(data[16] ?? 0),
                basic: Number(data[17] ?? 0),
            },
            transmittorTariffs: {
                peak: Number(data[18] ?? 0),
                standard: Number(data[19] ?? 0),
                offpeak: Number(data[20] ?? 0),
                basic: Number(data[21] ?? 0),
            },
            generatorTariffs: {
                peak: Number(data[22] ?? 0),
                standard: Number(data[23] ?? 0),
                offpeak: Number(data[24] ?? 0),
                basic: Number(data[25] ?? 0),
            }
        };

        console.log("✅ Tariff Data Retrieved:", userTariffs);
        return userTariffs;
    } catch (error) {
        console.error("❌ Error fetching tariff data:", error.reason || error.message);
        return null;
    }
}

module.exports = { getUserTariffs };







