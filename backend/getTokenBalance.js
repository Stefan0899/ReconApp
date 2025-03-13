require("dotenv").config();
const { ethers } = require("ethers");

// ✅ Set up connection to Sepolia via Alchemy
const factoryAddress = "0x15381B00823186EAA183a0395aF91CeF90aB5905"; // ✅ Replace with actual factory address
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const providerWallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY, provider);

// ✅ ABI for the contracts
const factoryABI = [
    "function tokenEp() external view returns (address)",
    "function tokenEs() external view returns (address)",
    "function tokenEo() external view returns (address)"
];

const tokenABI = [
    "function balanceOf(address owner) external view returns (uint256)"
];

// ✅ Function to fetch token balances
async function fetchEnergyTokenBalances(userAddress) {
    try {
        console.log(`🔹 Fetching energy token balances for: ${userAddress}`);

        // ✅ Connect to the factory contract
        const factoryContract = new ethers.Contract(factoryAddress, factoryABI, provider);

        // ✅ Fetch token addresses
        const tokenEpAddress = await factoryContract.tokenEp();
        const tokenEsAddress = await factoryContract.tokenEs();
        const tokenEoAddress = await factoryContract.tokenEo();

        console.log(`🔹 Token E1 Address: ${tokenEpAddress}`);
        console.log(`🔹 Token E2 Address: ${tokenEsAddress}`);
        console.log(`🔹 Token E3 Address: ${tokenEoAddress}`);

        // ✅ Connect to each energy token contract
        const tokenEp = new ethers.Contract(tokenEpAddress, tokenABI, provider);
        const tokenEs = new ethers.Contract(tokenEsAddress, tokenABI, provider);
        const tokenEo = new ethers.Contract(tokenEoAddress, tokenABI, provider);

        // ✅ Fetch balances
        const balanceEp = await tokenEp.balanceOf(userAddress);
        const balanceEs = await tokenEs.balanceOf(userAddress);
        const balanceEo = await tokenEo.balanceOf(userAddress);

        console.log(`✅ Ep Balance: ${ethers.formatEther(balanceEp)} Tokens`);
        console.log(`✅ Es Balance: ${ethers.formatEther(balanceEs)} Tokens`);
        console.log(`✅ Eo Balance: ${ethers.formatEther(balanceEo)} Tokens`);

        const balances = {
            EpTokens: ethers.formatEther(balanceEp),
            EsTokens: ethers.formatEther(balanceEs),
            EoTokens: ethers.formatEther(balanceEo)
        };

        return balances

    } catch (error) {
        console.error("❌ Error fetching energy token balances:", error.message);
        return null;
    }
}

// ✅ Export function for use in `server.js`
module.exports = { fetchEnergyTokenBalances };
