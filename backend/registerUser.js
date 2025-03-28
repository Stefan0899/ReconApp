require("dotenv").config();
const { ethers } = require("ethers");

const contractAddress = "0x2D4637E69eE8861D04B4ac890241C98bc7Ad8C5f"; // ✅ Replace with deployed contract address
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

// ✅ Load private keys for each entity from .env
const ownerWallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);
const providerWallet = new ethers.Wallet(process.env.PROVIDER_PRIVATE_KEY, provider);
const distributorWallet = new ethers.Wallet(process.env.DISTRIBUTOR_PRIVATE_KEY, provider);
const transmittorWallet = new ethers.Wallet(process.env.TRANSMITTOR_PRIVATE_KEY, provider);
const generatorWallet = new ethers.Wallet(process.env.GENERATOR_PRIVATE_KEY, provider);

// ✅ Contract ABI (Copy from your compiled contract JSON file)
const contractABI = [
    "function assignProviderToUser(address _user, address _provider) public",
    "function assignDistributorToUser(address _user, address _distributor) public",
    "function assignTransmittorToUser(address _user, address _transmittor) public",
    "function assignGeneratorToUser(address _user, address _generator) public",
    "function assignDistributorTariffToUser(address _user, uint256 _tariffId) public",
    "function assignTransmittorTariffToUser(address _user, uint256 _tariffId) public",
    "function assignGeneratorTariffToUser(address _user, uint256 _tariffId) public"
];

async function registerUser(userAddress) {
    console.log(`🔹 Registering user: ${userAddress}`);

    try {
        const ownerContract = new ethers.Contract(contractAddress, contractABI, ownerWallet);
        const providerContract = new ethers.Contract(contractAddress, contractABI, providerWallet);
        const distributorContract = new ethers.Contract(contractAddress, contractABI, distributorWallet);
        const transmittorContract = new ethers.Contract(contractAddress, contractABI, transmittorWallet);
        const generatorContract = new ethers.Contract(contractAddress, contractABI, generatorWallet);

        // Assign Provider
        try {
            console.log(`🔹 Assigning provider: ${providerWallet.address}`);
            let tx = await ownerContract.assignProviderToUser(userAddress, providerWallet.address);
            await tx.wait();
            console.log(`✅ Provider assigned`);
        } catch (err) {
            throw new Error(`Provider assignment failed: ${err.reason || err.message}`);
        }

        // Assign Distributor
        try {
            console.log(`🔹 Assigning distributor: ${distributorWallet.address}`);
            let tx = await ownerContract.assignDistributorToUser(userAddress, distributorWallet.address);
            await tx.wait();
            console.log(`✅ Distributor assigned`);
        } catch (err) {
            throw new Error(`Distributor assignment failed: ${err.reason || err.message}`);
        }

        // Assign Transmittor
        try {
            console.log(`🔹 Assigning transmittor: ${transmittorWallet.address}`);
            let tx = await ownerContract.assignTransmittorToUser(userAddress, transmittorWallet.address);
            await tx.wait();
            console.log(`✅ Transmittor assigned`);
        } catch (err) {
            throw new Error(`Transmittor assignment failed: ${err.reason || err.message}`);
        }

        // Assign Generator
        try {
            console.log(`🔹 Assigning generator: ${generatorWallet.address}`);
            let tx = await ownerContract.assignGeneratorToUser(userAddress, generatorWallet.address);
            await tx.wait();
            console.log(`✅ Generator assigned`);
        } catch (err) {
            throw new Error(`Generator assignment failed: ${err.reason || err.message}`);
        }

        // Assign Tariffs
        try {
            console.log(`🔹 Assigning distributor tariff`);
            let tx = await distributorContract.assignDistributorTariffToUser(userAddress, 1);
            await tx.wait();
            console.log(`✅ Distributor tariff assigned`);
        } catch (err) {
            throw new Error(`Distributor tariff assignment failed: ${err.reason || err.message}`);
        }

        try {
            console.log(`🔹 Assigning transmittor tariff`);
            let tx = await transmittorContract.assignTransmittorTariffToUser(userAddress, 1);
            await tx.wait();
            console.log(`✅ Transmittor tariff assigned`);
        } catch (err) {
            throw new Error(`Transmittor tariff assignment failed: ${err.reason || err.message}`);
        }

        try {
            console.log(`🔹 Assigning generator tariff`);
            let tx = await generatorContract.assignGeneratorTariffToUser(userAddress, 1);
            await tx.wait();
            console.log(`✅ Generator tariff assigned`);
        } catch (err) {
            throw new Error(`Generator tariff assignment failed: ${err.reason || err.message}`);
        }

        return {
            success: true,
            message: "✅ User registered and tariffs assigned successfully!",
            provider: providerWallet.address,
            distributor: distributorWallet.address,
            distributorTariffID: "1",
            transmittor: transmittorWallet.address,
            transmittorTariffID: "1",
            generator: generatorWallet.address,
            generatorTariffID: "1",
          };
          

    } catch (error) {
        console.error("❌ Error during registration:", error.message || error);
        return { success: false, message: error.message || "Unknown error" };
    }
}

module.exports = { registerUser };




