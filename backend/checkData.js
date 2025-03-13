const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

// ✅ Contract Constants
const contractAddress = "0xB16103De3B577C8384157A7B15660bA97469DBA8";
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

const contractABI = [
  "function viewAllUserData(address user) public view returns (uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint256,uint256,uint256,uint256,uint256,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32)"
];

const COUNTER_FILE = "invoice_counters.json"; // ✅ File to store user counters

// ✅ Function to fetch user data from smart contract
async function viewAllUserData(userAddress) {
  if (!userAddress || !ethers.isAddress(userAddress)) {
    throw new Error("Invalid Ethereum address");
  }

  try {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const data = await contract.viewAllUserData(userAddress);

    // ✅ Get the user's invoice counter
    let invoiceCount = getUserCounter(userAddress);
    let monthName = getMonthName(invoiceCount); // Convert number to month name

    // ✅ Format response
    const responseData = {
      success: true,
      message: `Billing was successful for ${monthName}`, // ✅ Returns "Billing was successful for April"
      peakUsage: data[0].toString(),
      stdUsage: data[1].toString(),
      offUsage: data[2].toString(),
      genPeakUsage: data[3].toString(),
      genStdUsage: data[4].toString(),
      genOffUsage: data[5].toString(),
      epBalance: data[6].toString(),
      esBalance: data[7].toString(),
      eoBalance: data[8].toString(),
      distributionFee: ethers.formatUnits(data[9], "wei"),
      transmissionFee: ethers.formatUnits(data[10], "wei"),
      energyFee: ethers.formatUnits(data[11], "wei"),
      providerFee: ethers.formatUnits(data[12], "wei"),
      totalBill: ethers.formatUnits(data[13], "wei"),
      distributorPeakTariff: data[14].toString(),
      distributorStandardTariff: data[15].toString(),
      distributorOffpeakTariff: data[16].toString(),
      distributorBasicTariff: data[17].toString(),
      transmittorPeakTariff: data[18].toString(),
      transmittorStandardTariff: data[19].toString(),
      transmittorOffpeakTariff: data[20].toString(),
      transmittorBasicTariff: data[21].toString(),
      generatorPeakTariff: data[22].toString(),
      generatorStandardTariff: data[23].toString(),
      generatorOffpeakTariff: data[24].toString(),
      generatorBasicTariff: data[25].toString(),
      peakODO: data[26].toString(),
      stdODO: data[27].toString(),
      offODO: data[28].toString(),
    };

    // ✅ Print Data
    console.log("\n📌 Billing Message:", responseData.message);
    console.log("🔹 Peak Usage:", responseData.peakUsage);
    console.log("🔹 Standard Usage:", responseData.stdUsage);
    console.log("🔹 Off-Peak Usage:", responseData.offUsage);
    console.log("🔋 Generated Peak Usage:", responseData.genPeakUsage);
    console.log("🔋 Generated Standard Usage:", responseData.genStdUsage);
    console.log("🔋 Generated Off-Peak Usage:", responseData.genOffUsage);
    console.log("💰 Energy Token Balances:");
    console.log("   - Ep Tokens:", responseData.epBalance);
    console.log("   - Es Tokens:", responseData.esBalance);
    console.log("   - Eo Tokens:", responseData.eoBalance);
    console.log("💵 Fees:");
    console.log("   - Distribution Fee:", responseData.distributionFee, "ETH");
    console.log("   - Transmission Fee:", responseData.transmissionFee, "ETH");
    console.log("   - Energy Fee:", responseData.energyFee, "ETH");
    console.log("   - Provider Fee:", responseData.providerFee, "ETH");
    console.log("   - Total Bill:", responseData.totalBill, "ETH");
    console.log("🏭 Distributor Tariffs:");
    console.log("   - Peak:", responseData.distributorPeakTariff);
    console.log("   - Standard:", responseData.distributorStandardTariff);
    console.log("   - Off-Peak:", responseData.distributorOffpeakTariff);
    console.log("   - Basic:", responseData.distributorBasicTariff);
    console.log("⚡ Transmittor Tariffs:");
    console.log("   - Peak:", responseData.transmittorPeakTariff);
    console.log("   - Standard:", responseData.transmittorStandardTariff);
    console.log("   - Off-Peak:", responseData.transmittorOffpeakTariff);
    console.log("   - Basic:", responseData.transmittorBasicTariff);
    console.log("🔋 Generator Tariffs:");
    console.log("   - Peak:", responseData.generatorPeakTariff);
    console.log("   - Standard:", responseData.generatorStandardTariff);
    console.log("   - Off-Peak:", responseData.generatorOffpeakTariff);
    console.log("   - Basic:", responseData.generatorBasicTariff);
    console.log("🔄 ODO Readings:");
    console.log("   - Peak ODO:", responseData.peakODO);
    console.log("   - Standard ODO:", responseData.stdODO);
    console.log("   - Off-Peak ODO:", responseData.offODO);

    return responseData;
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    throw new Error("Failed to fetch user data.");
  }
}

// ✅ Function to get the user's counter
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

// ✅ Function to convert number to month name
function getMonthName(invoiceCount) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // ✅ Ensure invoiceCount is within range 1-12
  const monthIndex = (invoiceCount - 1) % 12;
  return months[monthIndex];
}

// ✅ Main Function to Run in Terminal
async function main() {
  const userAddress = "0x5Ab76a41eeC00851002C861E3B3a9CFF134ca526"; // ✅ Replace with target address

  console.log("\n🚀 Fetching User Data for Address:", userAddress);
  await viewAllUserData(userAddress);
}

// ✅ Run the script
main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exitCode = 1;
});
