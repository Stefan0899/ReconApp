import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Import Bootstrap

async function fetchUserData(userAddress) {
  try {
    const response = await fetch("http://localhost:5000/viewAllUserData", {
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

const Invoicing = ({ walletAddress }) => {
  const [userData, setUserData] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // ✅ Process Data: Perform calculations and structure it
  const processUserData = (data) => {
    if (!data) return null;

    const dist_trans_diff_peak = data.distributorPeakTariff - data.transmittorPeakTariff;
    const dist_trans_diff_std = data.distributorStandardTariff - data.transmittorStandardTariff;
    const dist_trans_diff_off = data.distributorOffpeakTariff - data.transmittorOffpeakTariff;
    const dist_basic_fee = data.distributorBasicTariff;

    const dist_peak_fee = (data.epBalance * dist_trans_diff_peak) / 1e18;
    const dist_std_fee = (data.esBalance * dist_trans_diff_std) / 1e18;
    const dist_off_fee = (data.eoBalance * dist_trans_diff_off) / 1e18;
    const dist_basic_fee_eth = dist_basic_fee / 1e18;

    const total_tokens_bought = data.epBalance + data.esBalance + data.eoBalance;
    const total_dist_fee = dist_peak_fee + dist_std_fee + dist_off_fee + dist_basic_fee_eth;

    return {
      dist_trans_diff_peak,
      dist_trans_diff_std,
      dist_trans_diff_off,
      dist_basic_fee,
      dist_peak_fee,
      dist_std_fee,
      dist_off_fee,
      dist_basic_fee_eth,
      total_tokens_bought,
      total_dist_fee,
    };
  };

  // ✅ Fetch & Process Data
  const handleGenerateInvoice = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    setLoading(true);
    setStatus("Fetching user data...");

    const data = await fetchUserData(walletAddress);
    if (data) {
      setUserData(data);
      const processed = processUserData(data);
      setProcessedData(processed);
      setStatus("✅ Data retrieved successfully!");
    } else {
      setStatus("❌ Failed to fetch data.");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="text-center text-primary">Invoicing</h2>

        {/* Wallet Connection Required */}
        {!walletAddress ? (
          <p className="text-center text-danger mt-3">⚠️ Please connect your wallet in the Navbar.</p>
        ) : (
          <>
            {/* ✅ Generate Invoice Button */}
            <div className="text-center mt-4">
              <button
                onClick={handleGenerateInvoice}
                disabled={loading}
                className={`btn ${loading ? "btn-secondary" : "btn-success"}`}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    &nbsp;Fetching Data...
                  </>
                ) : (
                  "Generate Invoice"
                )}
              </button>
            </div>

            {/* ✅ Display Status Message */}
            {status && <p className="text-center text-warning mt-3">{status}</p>}

            {/* ✅ Display Energy Fee Table */}
            {processedData && (
              <div className="mt-4">
                <h3 className="text-center text-success">Energy Fee</h3>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>TOU Period</th>
                        <th>End-of-Month Token Balance</th>
                        <th>Distribution Tariff (c/Token)</th>
                        <th>Fee (ETH)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Peak</td>
                        <td>{userData.epBalance}</td>
                        <td>{processedData.dist_trans_diff_peak}</td>
                        <td>{processedData.dist_peak_fee.toFixed(6)}</td>
                      </tr>
                      <tr>
                        <td>Off-peak</td>
                        <td>{userData.eoBalance}</td>
                        <td>{processedData.dist_trans_diff_off}</td>
                        <td>{processedData.dist_off_fee.toFixed(6)}</td>
                      </tr>
                      <tr>
                        <td>Standard</td>
                        <td>{userData.esBalance}</td>
                        <td>{processedData.dist_trans_diff_std}</td>
                        <td>{processedData.dist_std_fee.toFixed(6)}</td>
                      </tr>
                      <tr>
                        <td>Basic</td>
                        <td>0</td>
                        <td>{processedData.dist_basic_fee}</td>
                        <td>{processedData.dist_basic_fee_eth.toFixed(6)}</td>
                      </tr>
                      <tr className="table-warning fw-bold">
                        <td>Total</td>
                        <td>{processedData.total_tokens_bought}</td>
                        <td></td>
                        <td>{processedData.total_dist_fee.toFixed(6)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Invoicing;
