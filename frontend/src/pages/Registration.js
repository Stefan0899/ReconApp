import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Bootstrap for styling
import { useEffect } from "react"; // ✅ Add `useEffect`
import "./registration.css";
const API_URL = process.env.REACT_APP_API_BASE_URL;



async function fetchUserData(userAddress) {
  try {
    const response = await fetch(`${API_URL}/viewAllUserData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

async function fetchUserMappings(userAddress) {
  try {
    const response = await fetch(`${API_URL}/getUserMappings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user mappings:", error);
    return null;
  }
}


// ✅ Register User Function
async function registerUser(userAddress) {
  try {
    const response = await fetch(`${API_URL}register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress }),
    });

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error("Error registering user:", error);
    return "❌ Registration failed.";
  }
}

async function requestTokenTransfer(userAddress) {
  try {
    const response = await fetch(`${API_URL}/transferTokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error requesting token transfer:", error);
    return null;
  }
}


function Registration({ walletAddress }) {
  const [status, setStatus] = useState(""); // ✅ Status messages
  const [processedData, setProcessedData] = useState(null); // ✅ Tariff Data
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [serviceProviders, setServiceProviders] = useState(null);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingTariffs, setLoadingTariffs] = useState(false);
  const [loadingBalance, setLoadingBalances] = useState(false);
  const [loadingTokenBuy, setLoadingTokenBuy] = useState(false);
  const [loadingETHBuy, setLoadingETHBuy] = useState(false);

  const [transferStatus, setTransferStatus] = useState(""); // ✅ Track transfer status
  const [transferData, setTransferData] = useState(null); // ✅ Store token transfer results
  const [tokenBalances, setTokenBalances] = useState(null);
  const [disableBuySepETH, setDisableBuySepETH] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const resetOutputs = () => {
    setStatus("");            // Clear status message
    setProcessedData(null);   // Clear tariff data
    setServiceProviders(null);// Clear service provider data
    setTokenBalances(null);   // Clear token balances
    setTransferData(null);    // Clear transfer data
    setTransferStatus("");    // Clear transfer status
  };  


  // ✅ Reset all state variables when the wallet changes or disconnects
  useEffect(() => {
    console.log("🔄 Wallet changed, resetting data...");
    setStatus("");
    setProcessedData(null);
    setServiceProviders(null);
    setLoading(false);
    setRegistering(false);
    setLoadingProviders(false);
    setLoadingTariffs(false);
    setLoadingBalances(false);
    setLoadingTokenBuy(false);
    setLoadingETHBuy(false);
    setTransferStatus("");  // Reset status
    setTransferData(null);  // Clear previous transfer results
  }, [walletAddress]);

  // ✅ Process User Data
  const processUserData = (data) => {
    if (!data) return null;
  
    const formatToTwoDecimals = (value) => (value ? Number(value).toFixed(2) : "0.00");
  
    const dist_trans_diff_peak = (data.distributorPeakTariff || 0) - (data.transmittorPeakTariff || 0);
    const dist_trans_diff_std = (data.distributorStandardTariff || 0) - (data.transmittorStandardTariff || 0);
    const dist_trans_diff_off = (data.distributorOffpeakTariff || 0) - (data.transmittorOffpeakTariff || 0);
    const dist_basic_tariff = data.distributorBasicTariff || 0;
  
    const trans_gen_diff_peak = (data.transmittorPeakTariff || 0) - (data.generatorPeakTariff || 0);
    const trans_gen_diff_std = (data.transmittorStandardTariff || 0) - (data.generatorStandardTariff || 0);
    const trans_gen_diff_off = (data.transmittorOffpeakTariff || 0) - (data.generatorOffpeakTariff || 0);
  
    const gen_peak_tariff = data.generatorPeakTariff || 0;
    const gen_std_tariff = data.generatorStandardTariff || 0;
    const gen_off_tariff = data.generatorOffpeakTariff || 0;
  
    const dist_peak_fee = formatToTwoDecimals((data.epBalance || 0) * dist_trans_diff_peak);
    const dist_std_fee = formatToTwoDecimals((data.esBalance || 0) * dist_trans_diff_std);
    const dist_off_fee = formatToTwoDecimals((data.eoBalance || 0) * dist_trans_diff_off);
    const dist_basic_fee = formatToTwoDecimals(dist_basic_tariff);
  
    const trans_peak_fee = formatToTwoDecimals(((data.epBalance || 0) * trans_gen_diff_peak) / 1e18);
    const trans_std_fee = formatToTwoDecimals(((data.esBalance || 0) * trans_gen_diff_std) / 1e18);
    const trans_off_fee = formatToTwoDecimals(((data.eoBalance || 0) * trans_gen_diff_off) / 1e18);
  
    const gen_peak_fee = formatToTwoDecimals(((gen_peak_tariff * (data.genPeakUsage || 0)) / 100));
    const gen_std_fee = formatToTwoDecimals(((gen_std_tariff * (data.genStdUsage || 0)) / 100));
    const gen_off_fee = formatToTwoDecimals(((gen_off_tariff * (data.genOffUsage || 0)) / 100));
  
    const total_energy_fee = formatToTwoDecimals((data.energyFee || 0) / 1e13);
    const total_dist_fee = formatToTwoDecimals((data.distributionFee || 0) / 1e13);
    const total_trans_fee = formatToTwoDecimals((data.transmissionFee || 0) / 1e13);
    const total_prov_fee = formatToTwoDecimals((data.providerFee || 0) / 1e13);
    const total_bill_fee = formatToTwoDecimals((data.totalBill || 0) / 1e13);
  
    const total_tokens_bought = Number((data.epBalance || 0) + (data.esBalance || 0) + (data.eoBalance || 0));
    const ep_tokens = data.epBalance || 0;
    const es_tokens = data.esBalance || 0;
    const eo_tokens = data.eoBalance || 0;
  
    const gen_peak_usage = Number(data.genPeakUsage);
    const gen_std_usage = Number(data.genStdUsage);
    const gen_off_usage = Number(data.genOffUsage);
    const gen_total_usage = gen_peak_usage + gen_std_usage + gen_off_usage;
  
    const tot_peak_usage = Number(data.peakUsage);
    const tot_std_usage = Number(data.stdUsage);
    const tot_off_usage = Number(data.offUsage);
    const tot_tot_usage = tot_peak_usage + tot_std_usage + tot_off_usage;
  
    return {
      dist_trans_diff_peak,
      dist_trans_diff_std,
      dist_trans_diff_off,
      dist_basic_tariff,
      dist_basic_fee,
      trans_gen_diff_peak,
      trans_gen_diff_std,
      trans_gen_diff_off,
      dist_peak_fee,
      dist_std_fee,
      dist_off_fee,
      trans_peak_fee,
      trans_std_fee,
      trans_off_fee,
      gen_peak_fee,
      gen_std_fee,
      gen_off_fee,
      total_energy_fee,
      total_dist_fee,
      total_trans_fee,
      total_prov_fee,
      total_bill_fee,
      total_tokens_bought,
      ep_tokens,
      es_tokens,
      eo_tokens,
      gen_peak_usage,
      gen_std_usage,
      gen_off_usage,
      gen_total_usage,
      gen_peak_tariff,
      gen_std_tariff, 
      gen_off_tariff,
      tot_peak_usage,
      tot_std_usage,
      tot_off_usage,
      tot_tot_usage
    };
  };

  const handleLoadServiceProviders = async () => {
    if (!walletAddress) return;
    resetOutputs(); // ✅ Clear previous outputs
    setLoadingProviders(true);
    setStatus("Fetching service providers...");

    const data = await fetchUserMappings(walletAddress);
    if (data) {
      setServiceProviders(data);
      setStatus("✅ Service providers loaded successfully!");
    } else {
      setStatus("❌ Failed to fetch service providers.");
    }

    setLoadingProviders(false);
  };

  const handleLoadTariffs = async () => {
    if (!walletAddress) return;
    resetOutputs(); // ✅ Clear previous outputs
    setLoadingTariffs(true);
    setStatus("Fetching tariffs...");
  
    const data = await fetchUserData(walletAddress);
    if (data) {
      const processedTariffs = processUserData(data); // ✅ Apply processUserData
      setProcessedData(processedTariffs); // ✅ Now, set the processed data
      setStatus("✅ Tariffs loaded successfully!");
    } else {
      setStatus("❌ Failed to fetch tariffs.");
    }
  
    setLoadingTariffs(false);
  };

  const handleRegister = async () => {
    if (!walletAddress) return;
    resetOutputs(); // ✅ Clear previous outputs
    setRegistering(true);
    setStatus("Processing registration...");

    const message = await registerUser(walletAddress);
    setStatus(message);

    setRegistering(false);
  };
  
  const handleTransfer = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    resetOutputs(); // ✅ Clear previous outputs
    setLoadingTokenBuy(true);
    setTransferStatus("⏳ Transferring tokens...");

    try {
      console.log("🔄 Requesting token transfer...");
      const data = await requestTokenTransfer(walletAddress);

      if (data) {
        console.log("✅ Token transfer completed:", data);
        setTransferData(data);
        setTransferStatus("✅ Token transfer successful!");
      } else {
        console.error("❌ API request failed.");
        setTransferStatus("❌ Token transfer failed.");
      }
    } catch (error) {
      console.error("❌ Error transferring tokens:", error);
      setTransferStatus("❌ Error during transfer.");
    }

    setLoadingTokenBuy(false);
  };

  const fetchTokenBalances = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    resetOutputs(); // ✅ Clear previous outputs
    setLoadingBalances(true);
  
    try {
      const response = await fetch(`${API_URL}/getTokenBalance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: walletAddress }),
      });
  
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const data = await response.json();
      setTokenBalances(data);
    
    } catch (error) {
      console.error("❌ Error fetching token balances:", error);
    }
  
    setLoadingBalances(false);
  };

  async function handleBuySepoliaETH() {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    resetOutputs(); // ✅ Clear previous outputs
    setLoadingETHBuy(true);
    setTransferStatus("⏳ Purchasing Sepolia ETH...");
    setDisableBuySepETH(true); // ✅ Disable button after clicking
  
    try {
      console.log("🔄 Requesting Sepolia ETH transfer...");
      const response = await fetch(`${API_URL}/transferSepEth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: walletAddress }), // Fixed 0.2 ETH transfer
      });
  
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const data = await response.json();
      console.log("✅ Sepolia ETH purchase successful:", data);
  
      setTransferData(data);
      setTransferStatus("✅ Sepolia ETH purchased successfully!");
  
      // ✅ Re-enable the button after 30 seconds
      setTimeout(() => {
        setDisableBuySepETH(false);
      }, 5000);
  
    } catch (error) {
      console.error("❌ Error purchasing Sepolia ETH:", error);
      setTransferStatus("❌ Sepolia ETH purchase failed.");
      setDisableBuySepETH(false); // ✅ Re-enable button if the request fails
    }
  
    setLoadingETHBuy(false);
  };


  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="section-header-200">Welcome!</h2>
        <p className="text-center text-muted">Please see the "Quick Start Guide" for a run through of our platform.</p>
      <div className="text-center">

      <div className="button-container">
        {/* ✅ How-To Guide Button */}
        <button
          className="custom-button guide-btn"
          onClick={() => setShowGuide(!showGuide)}
        >
          {showGuide ? "❌ Hide Guide" : "Quick Start Guide"}
        </button>
      </div>
      </div>

      {/* ✅ Guide Content (Only shown when `showGuide` is true) */}
      {showGuide && (
        <div className="card shadow p-4">
          <h3 className="text-center text-primary">📖 How to Use the Platform</h3>
          <p className="mt-3">
            Welcome! Follow these steps to use the energy trading platform:
          </p>
          <ol>
            <li>🔗 <b>Connect Your Wallet:</b> Click on the connect button in the Navbar.</li>
            <li>📝 <b>Register:</b> If you haven't registered, click the "Register" button.</li>
            <li>⚡ <b>View Your Tariffs:</b> Click "My Tariffs" to see pricing.</li>
            <li>🔄 <b>Buy Energy Tokens:</b> Click "Buy Energy Tokens" to purchase Ep, Es, or Eo tokens.</li>
            <li>💰 <b>Check Your Token Balance:</b> Click "My Token Balances" to view your current holdings.</li>
            <li>📑 <b>Run Billing:</b> Click "Run Billing" to calculate your monthly charges.</li>
            <li>📄 <b>Get Invoice:</b> Click "Get Invoice" after billing to review charges.</li>
            <li>💳 <b>Pay Fees:</b> Use "Pay Energy Fees" to settle outstanding balances.</li>
            <li>💲 <b>Buy Sepolia ETH:</b> Click "Buy Sepolia ETH" if you need testnet ETH.</li>
          </ol>
          <p className="text-center text-success">
            ✅ Need help? Contact support for assistance.
          </p>
        </div>
      )}

        <div className="button-container">
        {/* ✅ Registration Button */}
        {walletAddress && (
            <button
              type="button"
              onClick={handleRegister}
              disabled={registering}
              className="custom-button register-btn"
            >
              {registering ? "Processing..." : "Register"}
            </button>
        )}
        </div>
        {walletAddress &&
        <div className="section-container">
          <h3 className="section-header-2">Account Details</h3>
          <p className="text-center text-muted">Find your service providers, tariffs and energy token balances.</p>
        </div>
        }

        <div className="button-container">
        {/* ✅ My Service Providers Button */}
        {walletAddress && (
            <button
              type="button"
              onClick={handleLoadServiceProviders}
              disabled={loadingProviders}
              className="custom-button service-btn"

            >
              {loadingProviders ? "Loading..." : "My Service Providers"}
            </button>
        )}
        </div>

        {/* ✅ Display Service Providers (Transposed Table) */}
        {walletAddress && serviceProviders && (
          <div className="mt-4">
            <h3 className="text-center text-success">My Service Providers</h3>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Service</th>
                    <th>Address</th>
                    <th>Tariff ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Virtual Wheeling Platform</b></td>
                    <td>{serviceProviders.provider}</td>
                    <td>-</td> {/* No Tariff ID for Provider */}
                  </tr>
                  <tr>
                    <td><b>Distributor</b></td>
                    <td>{serviceProviders.distributor}</td>
                    <td>{serviceProviders.tariffID}</td>
                  </tr>
                  <tr>
                    <td><b>Transmittor</b></td>
                    <td>{serviceProviders.transmittor}</td>
                    <td>{serviceProviders.transmittorTariffID}</td>
                  </tr>
                  <tr>
                    <td><b>Generator</b></td>
                    <td>{serviceProviders.generator}</td>
                    <td>{serviceProviders.generatorTariffID}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="button-container">
        {/* ✅ Tariff Load Button */}
        {walletAddress && (
            <button
              type="button"
              onClick={handleLoadTariffs}
              disabled={loadingTariffs}
              className="custom-button tariff-btn"
              >
              {loading ? "Loading..." : "My Tariffs"}
            </button>
        )}
        </div>
        {/* ✅ Display Tariffs */}
        {walletAddress && processedData && (
          <div className="mt-5">
            <h3 className="text-center text-success">Tariff Details</h3>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Service</th>
                    <th>Peak</th>
                    <th>Standard</th>
                    <th>Off-peak</th>
                    <th>Basic</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Distribution</td>
                    <td>{processedData.dist_trans_diff_peak}</td>
                    <td>{processedData.dist_trans_diff_std}</td>
                    <td>{processedData.dist_trans_diff_off}</td>
                    <td>{processedData.dist_basic_tariff}</td>
                  </tr>
                  <tr>
                    <td>Transmission</td>
                    <td>{processedData.trans_gen_diff_peak}</td>
                    <td>{processedData.trans_gen_diff_std}</td>
                    <td>{processedData.trans_gen_diff_off}</td>
                    <td>{"-"}</td>
                  </tr>
                  <tr>
                    <td>Generation</td>
                    <td>{processedData.gen_peak_tariff}</td>
                    <td>{processedData.gen_std_tariff}</td>
                    <td>{processedData.gen_off_tariff}</td>
                    <td>{"-"}</td>
                  </tr>
                  <tr>
                    <td>Virtual Wheeling Platform</td>
                    <td>{"-"}</td>
                    <td>{"-"}</td>
                    <td>{"-"}</td>
                    <td>{"0.5% of Total Bill"}</td>
                  </tr>                 
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ✅ Message when Wallet is NOT Connected */}
        {!walletAddress && (
          <p className="text-center text-danger mt-3">
            ⚠️ Please connect your wallet in the Navbar to register, view your account or perform other actions.
          </p>
        )}

        <div className="button-container">
        {/* ✅ Fetch Load Button */}
        {walletAddress && (
            <button className="custom-button balance-btn" onClick={fetchTokenBalances} disabled={loadingBalance}>
              {loadingBalance ? "Loading..." : "My Token Balances"}
            </button>
        )}
        </div>

        {/* Show Token Balances Table */}
        {tokenBalances && (
              <div className="table-container mt-8">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Token Type</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Ep Tokens</td>
                        <td>{tokenBalances.EpTokens}</td>
                      </tr>
                      <tr>
                        <td>Es Tokens</td>
                        <td>{tokenBalances.EsTokens}</td>
                      </tr>
                      <tr>
                        <td>Eo Tokens</td>
                        <td>{tokenBalances.EoTokens}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
        )}
        {walletAddress && (
        <div className="section-container">
          <h3 className="section-header-3">Get Energy Tokens & SepoliaETH</h3>
          <p className="text-center text-muted">Transfer a random number of energy tokens and 0.2 SepoliaETH to your account.</p>
        </div>
        )}
        <div className="button-container">
        {/* ✅ Transfer Button */}
        {walletAddress && (
            <button
              type="button"
              onClick={handleTransfer}
              disabled={loadingTokenBuy}
              className="custom-button tokens-btn"
            >
              {loading ? "Processing..." : "Buy Energy Tokens"}
            </button>
        )}
        </div>

        {/* ✅ Show Transfer Results Only if Data Exists */}
        {transferData && (
          <div className="mt-4">
            <h3 className="text-center text-success">✅ Successful Transfer</h3>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Token</th>
                    <th>Amount</th>
                    <th>Transaction Detail</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Peak Energy (Ep)</td>
                    <td>{transferData.PeakTokens}</td>
                    <td>
                      <a href={`https://sepolia.etherscan.io/tx/${transferData.EpTxHash}`} target="_blank" rel="noopener noreferrer">
                        View on Etherscan
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Standard Energy (Es)</td>
                    <td>{transferData.StdTokens}</td>
                    <td>
                      <a href={`https://sepolia.etherscan.io/tx/${transferData.EsTxHash}`} target="_blank" rel="noopener noreferrer">
                        View on Etherscan
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Off-Peak Energy (Eo)</td>
                    <td>{transferData.OffTokens}</td>
                    <td>
                      <a href={`https://sepolia.etherscan.io/tx/${transferData.EoTxHash}`} target="_blank" rel="noopener noreferrer">
                        View on Etherscan
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="button-container">
        {walletAddress && (
            <button
              type="button"
              onClick={handleBuySepoliaETH}
              disabled={loadingETHBuy || disableBuySepETH} // ✅ Disable after purchase
              className="custom-button buy-eth-btn"
            >
              {loading ? "Processing..." : disableBuySepETH ? "⏳ Wait 5..." : "Tranfer Sepolia ETH"}
            </button>
        )}
        </div>

        {/* ✅ Show Sepolia ETH Transaction Result */}
        {transferData && (
          <div className="mt-4">
            <h3 className="text-center text-success">✅ Sepolia ETH Purchase Successful</h3>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount (ETH)</th>
                    <th>Transaction Hash</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{transferData.from}</td>
                    <td>{transferData.to}</td>
                    <td>{transferData.amount}</td>
                    <td>
                      <a href={`https://sepolia.etherscan.io/tx/${transferData.transactionHash}`} target="_blank" rel="noopener noreferrer">
                        View on Etherscan
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Registration;