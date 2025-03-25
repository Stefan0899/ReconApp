require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// ✅ Constants
const contractAddress = "0x2D4637E69eE8861D04B4ac890241C98bc7Ad8C5f"; // ✅ Replace with deployed contract address
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

// ✅ Replace with deployed token addresses
const EpToken = "0x80Aa523191C962211197D1AaC450cF5f9f5Eb874";
const EsToken = "0xa7db5E6Bb54f323EFD3b99ABf84EDC72046bfD86";
const EoToken = "0x0E46342329F8A0a9e27741E9DE8E88AED638e866";

// ✅ File to store user counters
const COUNTER_FILE = "invoice_counters.json";

// ✅ Function to get and update ODO readings
async function runBilling(user) {
    try {
        // ✅ Connect to the contract
        const contractABI = [
            "function viewAllUserData(address user) public view returns (uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint256,uint256,uint256,uint256,uint256,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32)",
            "function eomRecon(address user, address EpToken, address EsToken, address EoToken, uint32 peakODO, uint32 stdODO, uint32 offODO) external"
        ];

        const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
        const providerWallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY, provider);
        const providerContract = new ethers.Contract(contractAddress, contractABI, providerWallet);


        // ✅ Fetch previous ODO values
        const { peakODO: previousPeakODO, stdODO: previousStdODO, offODO: previousOffODO } = await fetchLastODOReadings(user);

        // ✅ Generate new ODO readings
        const peakODO = previousPeakODO + getRandom(4000, 8000);
        const stdODO = previousStdODO + getRandom(8000, 12000);
        const offODO = previousOffODO + getRandom(8000, 12000);

        
        const tx = await providerContract.eomRecon(
            user,
            EpToken,
            EsToken,
            EoToken,
            peakODO,
            stdODO,
            offODO
        );

        updateUserCounter(user);

        // ✅ Get the user's invoice counter
        let invoiceCount = getUserCounter(user);
        let monthName = getMonthName(invoiceCount); // Convert number to name
        
        // ✅ Return the success message with the month name
        return { success: true, message: `Billing was successful for ${monthName}` };

    } catch (error) {
        console.error("❌ Error generating invoice:", error.reason || error.message);
    }
}

// ✅ Function to generate a random number in a range
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/// ✅ Function to get the user's counter
function getUserCounter(user) {
    let counters = {};

    try {
        if (fs.existsSync(COUNTER_FILE)) {
            counters = JSON.parse(fs.readFileSync(COUNTER_FILE, "utf-8"));
        }
    } catch (error) {
        console.error("❌ Error reading counter file:", error.message);
    }

    // ✅ Ensure the counter is a valid number
    if (!counters[user] || isNaN(counters[user])) {
        counters[user] = 1; // Default to 1 if undefined or NaN
    }

    return counters[user];
}

// ✅ Function to update the user's counter
function updateUserCounter(user) {
    let counters = {};

    try {
        if (fs.existsSync(COUNTER_FILE)) {
            counters = JSON.parse(fs.readFileSync(COUNTER_FILE, "utf-8"));
        }
    } catch (error) {
        console.error("❌ Error reading counter file:", error.message);
    }

    // ✅ Increment counter and reset at 12
    counters[user] = (counters[user] >= 12) ? 1 : counters[user] + 1;

    try {
        fs.writeFileSync(COUNTER_FILE, JSON.stringify(counters, null, 2));
    } catch (error) {
        console.error("❌ Error writing counter file:", error.message);
    }
}


async function fetchLastODOReadings(user) {
    try {
        const contractABI = [
            "function viewAllUserData(address user) public view returns (uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint256,uint256,uint256,uint256,uint256,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32)"
        ];
        const providerContract = new ethers.Contract(contractAddress, contractABI, provider);

        // ✅ Call viewAllUserData and extract the ODO values (last 3 values in return array)
        const data = await providerContract.viewAllUserData(user);

        // Extracting ODO readings (last 3 values in return)
        const previousPeakODO = Number(data[data.length - 3] ?? 0);
        const previousStdODO = Number(data[data.length - 2] ?? 0);
        const previousOffODO = Number(data[data.length - 1] ?? 0);

        return { peakODO: previousPeakODO, stdODO: previousStdODO, offODO: previousOffODO };
    } catch (error) {
        console.error("❌ Error fetching ODO readings:", error.message);
        return { peakODO: 0, stdODO: 0, offODO: 0 };
    }
}

// ✅ Function to convert month number to name
function getMonthName(monthNumber) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber - 1] || "Unknown"; // Ensure valid month
}

module.exports = { runBilling };
