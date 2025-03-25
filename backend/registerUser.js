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
    "function assignDistributorTariffToUser(address user, uint256 tariffId) public",
    "function assignTransmittorTariffToUser(address user, uint256 tariffId) public",
    "function assignGeneratorTariffToUser(address user, uint256 tariffId) public"
];

async function registerUser(userAddress) {
    try {
        console.log(`🔹 Registering user: ${userAddress}`);

        // ✅ Connect to contract with the correct wallet signers
        const ownerContract = new ethers.Contract(contractAddress, contractABI, ownerWallet);
        const providerContract = new ethers.Contract(contractAddress, contractABI, providerWallet);
        const distributorContract = new ethers.Contract(contractAddress, contractABI, distributorWallet);
        const transmittorContract = new ethers.Contract(contractAddress, contractABI, transmittorWallet);
        const generatorContract = new ethers.Contract(contractAddress, contractABI, generatorWallet);

        // ✅ Assign Provider
        console.log(`🔹 Assigning provider: ${providerWallet.address}`);
        let tx = await ownerContract.assignProviderToUser(userAddress, providerWallet.address);
        await tx.wait();
        console.log(`✅ Provider assigned: ${providerWallet.address}`);

        // ✅ Assign Distributor
        console.log(`🔹 Assigning distributor: ${distributorWallet.address}`);
        tx = await ownerContract.assignDistributorToUser(userAddress, distributorWallet.address);
        await tx.wait();
        console.log(`✅ Distributor assigned: ${distributorWallet.address}`);

        // ✅ Assign Transmittor
        console.log(`🔹 Assigning transmittor: ${transmittorWallet.address}`);
        tx = await ownerContract.assignTransmittorToUser(userAddress, transmittorWallet.address);
        await tx.wait();
        console.log(`✅ Transmittor assigned: ${transmittorWallet.address}`);

        // ✅ Assign Generator
        console.log(`🔹 Assigning generator: ${generatorWallet.address}`);
        tx = await ownerContract.assignGeneratorToUser(userAddress, generatorWallet.address);
        await tx.wait();
        console.log(`✅ Generator assigned: ${generatorWallet.address}`);

        // ✅ Assign Tariffs (Assuming tariffs are already set)
        console.log(`🔹 Assigning distributor tariff to user: ${userAddress}`);
        tx = await distributorContract.assignTariffToUser(userAddress, 1);
        await tx.wait();
        console.log("✅ Distributor Tariff assigned successfully!");

        console.log(`🔹 Assigning transmittor tariff to user: ${userAddress}`);
        tx = await transmittorContract.assignTransmittorTariffToUser(userAddress, 1);
        await tx.wait();
        console.log("✅ Transmittor Tariff assigned successfully!");

        console.log(`🔹 Assigning generator tariff to user: ${userAddress}`);
        tx = await generatorContract.assignGeneratorTariffToUser(userAddress, 1);
        await tx.wait();
        console.log("✅ Generator Tariff assigned successfully!");

        return { success: true, message: "User registered and tariffs assigned successfully!" };
    } catch (error) {
        console.error("❌ Error during registration:", error.reason || error.message);
        return { success: false, message: error.reason || error.message };
    }
}

module.exports = { registerUser };




