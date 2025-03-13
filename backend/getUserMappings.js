require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

// ✅ Set up connection to Sepolia via Alchemy
const contractAddress = "0xB16103De3B577C8384157A7B15660bA97469DBA8"; // ✅ Replace with deployed contract address
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const providerWallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY, provider);

// ✅ Contract ABI (Ensure these function signatures match your smart contract)
const contractABI = [
  "function distributors(address) public view returns (address)",
  "function transmittors(address) public view returns (address)",
  "function generators(address) public view returns (address)",
  "function providers(address) public view returns (bool)",
  "function transmittorsRegistered(address) public view returns (bool)",
  "function generatorsRegistered(address) public view returns (bool)",
  "function userProvider(address) public view returns (address)",
  "function userTariffID(address) public view returns (uint256)",
  "function userDistributor(address) public view returns (address)",
  "function userTransmittor(address) public view returns (address)",
  "function userTransmittorTariffID(address) public view returns (uint256)",
  "function userGenerator(address) public view returns (address)",
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

    // ✅ Fetch values from the smart contract
    const provider = await contract.userProvider(userAddress);
    const distributor = await contract.userDistributor(userAddress);
    const tariffID = await contract.userTariffID(userAddress);
    const transmittor = await contract.userTransmittor(userAddress);
    const transmittorTariffID = await contract.userTransmittorTariffID(userAddress);
    const generator = await contract.userGenerator(userAddress);
    const generatorTariffID = await contract.userGeneratorTariffID(userAddress);

    const result = {
      provider,
      distributor,
      tariffID: Number(tariffID),
      transmittor,
      transmittorTariffID: Number(transmittorTariffID),
      generator,
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


