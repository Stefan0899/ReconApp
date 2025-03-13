import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Import Bootstrap
import "./Invoicing.css";
import { useEffect } from "react"; // ✅ Add `useEffect`
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

const Invoicing = ({ walletAddress }) => {
  const [userData, setUserData] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [billingStatus, setBillingStatus] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState("");

  // ✅ Clear data when wallet address changes
  useEffect(() => {
    if (!walletAddress) {
      console.log("🔄 Wallet disconnected. Resetting data...");
      setUserData(null);
      setProcessedData(null);
      setBillingStatus("");
      setInvoiceStatus("");
      setLoadingBilling(false);
      setLoadingInvoice(false);
    }
  }, [walletAddress]);

  // ✅ Process Data: Keep ALL calculations + fix undefined errors
  const processUserData = (data) => {
    if (!data) return null;
    const formatToTwoDecimals = (value) => (value ? Number(value).toFixed(2) : "0.00");

    const ep_tokens = Number(data.epBalance || 0);
    const es_tokens = Number(data.esBalance || 0);
    const eo_tokens = Number(data.eoBalance || 0);
    const total_tokens_bought = ep_tokens + es_tokens + eo_tokens;
    
    const gen_peak_usage = Number(data.genPeakUsage);
    const gen_std_usage = Number(data.genStdUsage);
    const gen_off_usage = Number(data.genOffUsage);
    const gen_total_usage = gen_peak_usage + gen_std_usage + gen_off_usage;
    
    const tot_peak_usage = Number(data.peakUsage);
    const tot_std_usage = Number(data.stdUsage);
    const tot_off_usage = Number(data.offUsage);
    const tot_tot_usage = tot_peak_usage + tot_std_usage + tot_off_usage;
    
    // ✅ Set equal to token balance, but cannot exceed total usage
    const peak_kwh_serviced = ep_tokens > tot_peak_usage ? tot_peak_usage : ep_tokens;
    const std_kwh_serviced = es_tokens > tot_std_usage ? tot_std_usage : es_tokens;
    const off_kwh_serviced = eo_tokens > tot_off_usage ? tot_off_usage : eo_tokens;    

    const dist_trans_diff_peak = (data.distributorPeakTariff || 0) - (data.transmittorPeakTariff || 0);
    const dist_trans_diff_std = (data.distributorStandardTariff || 0) - (data.transmittorStandardTariff || 0);
    const dist_trans_diff_off = (data.distributorOffpeakTariff || 0) - (data.transmittorOffpeakTariff || 0);
    const dist_basic_tariff = data.distributorBasicTariff || 0;

    const trans_gen_diff_peak = (data.transmittorPeakTariff || 0) - (data.generatorPeakTariff || 0);
    const trans_gen_diff_std = (data.transmittorStandardTariff || 0) - (data.generatorStandardTariff || 0);
    const trans_gen_diff_off = (data.transmittorOffpeakTariff || 0) - (data.generatorOffpeakTariff || 0);

    const gen_peak_tariff = (data.generatorPeakTariff || 0);
    const gen_std_tariff = (data.generatorStandardTariff || 0);
    const gen_off_tariff = (data.generatorOffpeakTariff || 0);

    const dist_peak_fee = Number(formatToTwoDecimals((peak_kwh_serviced || 0) * dist_trans_diff_peak/100));
    const dist_std_fee = Number(formatToTwoDecimals((std_kwh_serviced || 0) * dist_trans_diff_std/100));
    const dist_off_fee = Number(formatToTwoDecimals((off_kwh_serviced || 0) * dist_trans_diff_off/100));
    const dist_basic_fee = Number(formatToTwoDecimals(data.distributorBasicTariff || 0)/100);
    const dist_fee_last = formatToTwoDecimals(dist_peak_fee + dist_std_fee + dist_off_fee + dist_basic_fee);

    const trans_peak_fee = Number(formatToTwoDecimals((peak_kwh_serviced || 0) * trans_gen_diff_peak/100));
    const trans_std_fee = Number(formatToTwoDecimals((std_kwh_serviced || 0) * trans_gen_diff_std/100));
    const trans_off_fee = Number(formatToTwoDecimals((off_kwh_serviced || 0) * trans_gen_diff_off/100));
    const trans_fee_last = formatToTwoDecimals(trans_peak_fee + trans_std_fee + trans_off_fee);

    const gen_peak_fee = Number(formatToTwoDecimals(((data.generatorPeakTariff || 0) * (data.genPeakUsage || 0)) / 100));
    const gen_std_fee = Number(formatToTwoDecimals(((data.generatorStandardTariff || 0) * (data.genStdUsage || 0)) / 100));
    const gen_off_fee = Number(formatToTwoDecimals(((data.generatorOffpeakTariff || 0) * (data.genOffUsage || 0))/ 100));
    const gen_fee_last = formatToTwoDecimals(gen_peak_fee + gen_std_fee + gen_off_fee);

    const total_energy_fee = formatToTwoDecimals((data.energyFee || 0) / 1e13);
    const total_dist_fee = formatToTwoDecimals((data.distributionFee|| 0 )/1e13);
    const total_trans_fee = formatToTwoDecimals((data.transmissionFee || 0) / 1e13);
    const total_prov_fee = formatToTwoDecimals((data.providerFee || 0) / 1e13);
    const total_bill_fee = formatToTwoDecimals((data.totalBill || 0) / 1e13);


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
      tot_tot_usage,
      peak_kwh_serviced,
      std_kwh_serviced,
      off_kwh_serviced,
      dist_fee_last,
      trans_fee_last,
      gen_fee_last
    };
  };

  const handleRunBilling = async () => {
    if (!walletAddress) {
        alert("Please connect your wallet first!");
        return;
    }

    setLoadingBilling(true);
    setBillingStatus("⚡ Running billing process...");
    
    // ✅ CLEAR invoice data before billing runs
    setProcessedData(null);
    setUserData(null);
    setInvoiceStatus("");
    
    try {
        const response = await fetch(`${API_URL}/runBilling`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userAddress: walletAddress }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Billing failed.");

        console.log("✅ Billing Result:", result);
        setBillingStatus(`✅ ${result.message}`);

        // ✅ Disable Get Invoice button for 10 seconds
        setLoadingInvoice(true);
        setInvoiceStatus("⏳ Please wait 10 seconds before fetching the invoice...");

        setTimeout(() => {
            setLoadingInvoice(false);
            setInvoiceStatus("✅ You can now fetch your invoice.");
        }, 10000); // 10-second delay
    } catch (error) {
        console.error("❌ Error running billing:", error);
        setBillingStatus("❌ Billing failed.");
    }

    setLoadingBilling(false);
  };



  // ✅ Handle Invoice Fetching
  const handleGenerateInvoice = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    setLoadingInvoice(true);
    setInvoiceStatus("📄 Fetching invoice data...");

    try {
      console.log("🔄 Fetching new invoice data...");
      const data = await fetchUserData(walletAddress);

      if (data && data.success) {
        console.log("✅ New invoice data received:", data);

        setUserData(data);
        setProcessedData(processUserData(data));

        setInvoiceStatus(`✅ Invoice for ${data.message.split("for ")[1]} loaded!`);
        setBillingStatus(""); // ✅ Clear Billing Status when new invoice is fetched
      } else {
        console.error("❌ API request failed:", data);
        setInvoiceStatus("❌ Failed to fetch data.");
      }
    } catch (error) {
      console.error("❌ Error fetching invoice data:", error);
      setInvoiceStatus("❌ Failed to fetch data.");
    }

    setLoadingInvoice(false);
  };
  

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="section-header-12">Invoicing</h2>
        <p className="text-center text-muted">Clicking on "Run Billing" will generate a bill, which can be viewed via "Get Invoice".</p>
  
        {!walletAddress ? (
          <p className="text-center text-danger mt-3">
            ⚠️ Please connect your wallet in the Navbar.
          </p>
        ) : (
          <>
           {/* Buttons Section */}
          <div className="button-container">
            {/* Run Billing Button */}
            <button className="custom-button runbill-btn" onClick={handleRunBilling} disabled={loadingBilling}>
              {loadingBilling ? "⚡ Running Billing..." : "⚡ Run Billing"}
            </button>

            {/* ✅ Show Billing Status Under Run Billing */}
            {billingStatus && <p className="text-center text-warning mt-2">{billingStatus}</p>}

            {/* Get Invoice Button */}
            <button
              onClick={handleGenerateInvoice}
              disabled={loadingInvoice}
              className="custom-button getinv-btn"
            >
              {loadingInvoice ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  &nbsp;Fetching Data...
                </>
              ) : (
                "📄 Get Invoice"
              )}
            </button>

            {/* ✅ Show Invoice Status Under Get Invoice */}
            {invoiceStatus && <p className="text-center text-warning mt-2">{invoiceStatus}</p>}
          </div>


  
            {processedData && (
              <>

                {/* Section: Fee Breakdown */}
                <h2 className="text-center text-primary mt-4">📊 Consumption Breakdown</h2>
                {/* Distribution Fee Table */}
                <div className="table-container-1">
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>TOU Period</th>
                          <th>Total Consumption (kWh)</th>
                          <th>End-of-Month Token Balance</th>
                          <th>Generator Consumption</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Peak</td>
                          <td>{processedData.tot_peak_usage}</td>
                          <td>{processedData.ep_tokens}</td>
                          <td>{processedData.gen_peak_usage}</td>
                        </tr>
                        <tr>
                          <td>Standard</td>
                          <td>{processedData.tot_std_usage}</td>
                          <td>{processedData.es_tokens}</td>
                          <td>{processedData.gen_std_usage}</td>
                        </tr>
                        <tr>
                          <td>Off-peak</td>
                          <td>{processedData.tot_off_usage}</td>
                          <td>{processedData.eo_tokens}</td>
                          <td>{processedData.gen_off_usage}</td>
                        </tr>
                        <tr className="table-warning fw-bold">
                          <td>Total</td>
                          <td>{processedData.tot_tot_usage}</td>
                          <td>{processedData.total_tokens_bought}</td>
                          <td>{processedData.gen_total_usage}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section: Fee Breakdown */}
                <h2 className="text-center text-primary mt-4">💰 Fee Breakdown</h2>
  
                {/* Distribution Fee Table */}
                <div className="table-container">
                  <h3 className="text-center text-success">Distribution Fee</h3>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>TOU Period</th>
                          <th>Energy Distributed (kWh)</th>
                          <th>Distribution Tariff (c/kWh)</th>
                          <th>Fee (R)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Peak</td>
                          <td>{processedData.peak_kwh_serviced}</td>
                          <td>{processedData.dist_trans_diff_peak}</td>
                          <td>{processedData.dist_peak_fee}</td>
                        </tr>
                        <tr>
                          <td>Standard</td>
                          <td>{processedData.std_kwh_serviced}</td>
                          <td>{processedData.dist_trans_diff_std}</td>
                          <td>{processedData.dist_std_fee}</td>
                        </tr>
                        <tr>
                          <td>Off-peak</td>
                          <td>{processedData.off_kwh_serviced}</td>
                          <td>{processedData.dist_trans_diff_off}</td>
                          <td>{processedData.dist_off_fee}</td>
                        </tr>
                        <tr>
                          <td>Basic</td>
                          <td>-</td>
                          <td>{processedData.dist_basic_tariff}</td>
                          <td>{processedData.dist_basic_fee}</td>
                        </tr>
                        <tr className="table-warning fw-bold">
                          <td>Total</td>
                          <td>{processedData.total_tokens_bought}</td>
                          <td></td>
                          <td>{processedData.dist_fee_last}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
  
                {/* Transmission Fee Table */}
                <div className="table-container">
                  <h3 className="text-center text-success">Transmission Fee</h3>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>TOU Period</th>
                          <th>Energy Transmitted (kWh)</th>
                          <th>Transmission Tariff (c/kWh)</th>
                          <th>Fee (R)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Peak</td>
                          <td>{processedData.peak_kwh_serviced}</td>
                          <td>{processedData.trans_gen_diff_peak}</td>
                          <td>{processedData.trans_peak_fee}</td>
                        </tr>
                        <tr>
                          <td>Standard</td>
                          <td>{processedData.std_kwh_serviced}</td>
                          <td>{processedData.trans_gen_diff_std}</td>
                          <td>{processedData.trans_std_fee}</td>
                        </tr>
                        <tr>
                          <td>Off-peak</td>
                          <td>{processedData.off_kwh_serviced}</td>
                          <td>{processedData.trans_gen_diff_off}</td>
                          <td>{processedData.trans_off_fee}</td>
                        </tr>
                        <tr className="table-warning fw-bold">
                          <td>Total</td>
                          <td>{processedData.total_tokens_bought}</td>
                          <td></td>
                          <td>{processedData.trans_fee_last}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
  
                {/* Generation Fee Table */}
                <div className="table-container">
                  <h3 className="text-center text-success">Generation Fee</h3>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>TOU Period</th>
                          <th>Generation Consumption (kWh)</th>
                          <th>Generation Tariff (c/kWh)</th>
                          <th>Fee (R)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Peak</td>
                          <td>{processedData.gen_peak_usage}</td>
                          <td>{processedData.gen_peak_tariff}</td>
                          <td>{processedData.gen_peak_fee}</td>
                        </tr>
                        <tr>
                          <td>Standard</td>
                          <td>{processedData.gen_std_usage}</td>
                          <td>{processedData.gen_std_tariff}</td>
                          <td>{processedData.gen_std_fee}</td>
                        </tr>
                        <tr>
                          <td>Off-peak</td>
                          <td>{processedData.gen_off_usage}</td>
                          <td>{processedData.gen_off_tariff}</td>
                          <td>{processedData.gen_off_fee}</td>
                        </tr>
                        <tr className="table-warning fw-bold">
                          <td>Total</td>
                          <td>{processedData.gen_total_usage}</td>
                          <td></td>
                          <td>{processedData.gen_fee_last}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
  
                {/* Invoice Summary Section */}
                <h2 className="text-center text-primary mt-4">🧾 Accounts Payable </h2>
                {/* ✅ Show "Your Account is Settled" if the total bill is zero */}
                {processedData.total_bill_fee === "0.00" ? (
                  <p className="text-center text-success fw-bold">✅ Your Account is Settled</p>
                ) : null}
                <div className="table-container">
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Service Provider</th>
                          <th>Fee (R)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Distribution</td>
                          <td className="fee-column">{processedData.total_dist_fee}</td>
                        </tr>
                        <tr>
                          <td>Transmission</td>
                          <td className="fee-column">{processedData.total_trans_fee}</td>
                        </tr>
                        <tr>
                          <td>Generator</td>
                          <td className="fee-column">{processedData.total_energy_fee}</td>
                        </tr>
                        <tr>
                          <td>Data Provider *(0.5% Transaction Fee)</td>
                          <td className="fee-column">{processedData.total_prov_fee}</td>
                        </tr>
                        <tr className="table-warning fw-bold">
                          <td>Total Amount Owed (incl. VAT)</td>
                          <td className="fee-column">{processedData.total_bill_fee}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="text-center mt-4">
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ Print / Save as PDF
              </button>
            </div>
              </>
            )}

          </>
        )}
      </div>
    </div>
  ); }
  export default Invoicing;