require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

// ✅ Set up connection to Sepolia via Alchemy
const contractAddress = "0x2D4637E69eE8861D04B4ac890241C98bc7Ad8C5f"; // Replace with your deployed contract address
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const providerWallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY, provider);

// ✅ Contract ABI - matching your updated mappings and structure
const contractABI = [
  // Role mappings
  "function providers(address) public view returns (bool isRegistered)",
  "function distributors(address) public view returns (bool isRegistered)",
  "function transmittors(address) public view returns (bool isRegistered)",
  "function generators(address) public view returns (bool isRegistered)",

  // User -> Role assignments
  "function userProvider(address) public view returns (address)",
  "function userDistributor(address) public view returns (address)",
  "function userTransmittor(address) public view returns (address)",
  "function userGenerator(address) public view returns (address)",

  // Tariff IDs mapped per user for each role
  "function userDistributorTariffID(address) public view returns (uint256)",
  "function userTransmittorTariffID(address) public view returns (uint256)",
  "function userGeneratorTariffID(address) public view returns (uint256)"
];

// ✅ Connect to the Smart Contract
const contract = new ethers.Contract(contractAddress, contractABI, providerWallet);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Function to Fetch User Mappings
async function getUserMappings(userAddress) {
  try {
    if (!userAddress) {
      throw new Error("User address is required.");
    }

    console.log(`Fetching mappings for: ${userAddress}`);

    // Fetch assigned entities
    const providerAddr = await contract.userProvider(userAddress);
    const distributorAddr = await contract.userDistributor(userAddress);
    const transmittorAddr = await contract.userTransmittor(userAddress);
    const generatorAddr = await contract.userGenerator(userAddress);

    // Fetch tariff IDs for each assigned entity
    const distributorTariffID = await contract.userDistributorTariffID(userAddress);
    const transmittorTariffID = await contract.userTransmittorTariffID(userAddress);
    const generatorTariffID = await contract.userGeneratorTariffID(userAddress);

    const result = {
      provider: providerAddr,
      distributor: distributorAddr,
      distributorTariffID: Number(distributorTariffID),
      transmittor: transmittorAddr,
      transmittorTariffID: Number(transmittorTariffID),
      generator: generatorAddr,
      generatorTariffID: Number(generatorTariffID),
    };

    console.log("Fetched Data:", result);
    return result;
  } catch (error) {
    console.error("Error fetching user mappings:", error);
    return { error: "Failed to fetch user mappings." };
  }
}

module.exports = { getUserMappings };



