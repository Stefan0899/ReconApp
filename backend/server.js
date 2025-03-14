require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const { registerUser } = require("./registerUser");
const { getUserTariffs } = require("./viewTariffs");
const { getUserMappings } = require("./getUserMappings");
const { runBilling } = require("./runBilling");
const { viewAllUserData } = require("./viewAllUserData"); // ✅ Import the separate module
const { transferTokens } = require("./transferTokens");
const { fetchEnergyTokenBalances } = require("./getTokenBalance");
const { sendSepoliaETH } = require("./transferSepEth");

const app = express();
app.use(express.json());
app.use(cors());

// Allow CORS for all origins (or specify frontend domain)
app.use(cors({ origin: "https://energyreconapp.onrender.com" }));

// If you want to allow multiple domains:
const allowedOrigins = ["https://energyreconapp.onrender.com", "http://localhost:3000"];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

// ✅ User Registration Route
app.post("/register", async (req, res) => {
  const { userAddress } = req.body;
  if (!userAddress) {
    return res.status(400).json({ success: false, message: "User address is required" });
  }

  try {
    const result = await registerUser(userAddress);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Fetch Tariffs Route
app.post("/viewTariffs", async (req, res) => {
  const { userAddress } = req.body;
  if (!userAddress) return res.status(400).json({ error: "User address is required" });

  try {
    const tariffData = await getUserTariffs(userAddress);
    res.json(tariffData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tariffs", details: error.message });
  }
});

// ✅ Fetch All User Data Route (Now Uses the Separate Module)
app.post("/viewAllUserData", async (req, res) => {
  const { userAddress } = req.body;

  try {
    const data = await viewAllUserData(userAddress);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Express Route to Fetch User Mappings
app.post("/getUserMappings", async (req, res) => {
  try {
    const { userAddress } = req.body;
    const data = await getUserMappings(userAddress);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user mappings." });
  }
});

// ✅ Run Billing Route
app.post("/runBilling", async (req, res) => {
  const { userAddress } = req.body;

  try {
    const result = await runBilling(userAddress);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to run billing." });
  }
});

// ✅ Transfer Tokens
app.post("/transferTokens", async (req, res) => {
    const { userAddress } = req.body;
  
    try {
      const result = await transferTokens(userAddress);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to transfer tokens." });
    }
});

// ✅ Get TokenBalance Fees Route
app.post("/getTokenBalance", async (req, res) => {
  const { userAddress} = req.body;
  try {
      const result = await fetchEnergyTokenBalances(userAddress);
      res.json(result);
  } catch (error) {
      console.error("❌ Error processing payment:", error.message);
      res.status(500).json({ error: "Failed to process payment." });
  }
});

// ✅ Send Sepolia ETH Route
  app.post("/transferSepEth", async (req, res) => {
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({ error: "Missing user address." });
    }

    try {
        const result = await sendSepoliaETH(userAddress, "0.2"); // ✅ Explicitly set amount
        res.json(result);
    } catch (error) {
        console.error("❌ Error processing Sepolia ETH transfer:", error.message);
        res.status(500).json({ error: "Failed to transfer Sepolia ETH." });
    }
  });

  
  // ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});