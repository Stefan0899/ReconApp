import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Payments.css";
const API_URL = process.env.REACT_APP_API_BASE_URL;


async function fetchUserBill(userAddress) {
  try {
    const response = await fetch(`${API_URL}/viewAllUserData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.totalBill; // ✅ Extract totalBill
  } catch (error) {
    console.error("❌ Error fetching bill:", error);
    return null;
  }
}

async function payEnergyFees(userAddress, privateKey) {
  try {
    const response = await fetch(`${API_URL}/payEnergyFees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress, privateKey }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error processing payment:", error);
    return null;
  }
}

function Payment({ walletAddress }) {
  const [totalBill, setTotalBill] = useState(null);
  const [privateKey, setPrivateKey] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchUserBill(walletAddress).then((bill) => {
        if (bill) {
          setTotalBill(bill);
        } else {
          setTotalBill("❌ Failed to load bill.");
        }
      });
    } else {
      // Reset when wallet disconnects
      setTotalBill(null);
      setPrivateKey("");
      setPaymentStatus("");
      setTransactionHash("");
      setPaymentAmount("");
    }
  }, [walletAddress]);

  const handlePayment = async () => {
    if (!walletAddress || !privateKey) {
      alert("Please connect your wallet and enter your private key!");
      return;
    }

    setLoading(true);
    setPaymentStatus("⏳ Processing payment...");

    try {
      console.log("🔄 Requesting energy fee payment...");
      const result = await payEnergyFees(walletAddress, privateKey);

      if (result && result.success) {
        console.log("✅ Payment successful:", result);
        setPaymentStatus("✅ Payment Successful!");
        setPaymentAmount(result.totalPayment);
        setTransactionHash(result.transactionHash);
      } else {
        console.error("❌ Payment failed.");
        setPaymentStatus("❌ Payment Failed.");
      }
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      setPaymentStatus("❌ Error during payment.");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="section-header">Payment</h2>
        <p className="text-center text-muted">Settle your oustanding energy bill by providing your private key in the text box and pressing pay.</p>

        {!walletAddress ? (
          <p className="text-center text-danger mt-3">
            ⚠️ Please connect your wallet from the Navbar.
          </p>
        ) : (
          <>
            {/* ✅ Outstanding Bill Section */}
            <div className="mt-4">
              <h3 className="section-header">Your Oustanding Amount:</h3>
              <p className="text-center fs-5">
                {totalBill !== null ? `R ${(totalBill/1e13).toFixed(2)} = ETH ${(totalBill/1e18).toFixed(4)}` : "Loading..."}
              </p>
            </div>

            {/* ✅ Pay Energy Fees Section */}
            <h3 className="section-header">💳 Settle Energy Bill</h3>
            <div className="row justify-content-center">
              <div className="col-md-6">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter Private Key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
              </div>
              <div className="col-auto">
                <button
                  className="custom-button pay-btn"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Pay"}
                </button>
              </div>
            </div>

            {/* ✅ Payment Status */}
            {paymentStatus && <p className="text-center text-warning mt-3">{paymentStatus}</p>}

            {/* ✅ Payment Details Table */}
            {transactionHash && paymentAmount && (
              <div className="mt-4">
                <h3 className="text-center text-success">✅ Payment Details</h3>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Transaction Hash</th>
                        <th>Amount Paid (ETH)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{transactionHash}</td>
                        <td>{paymentAmount}</td>
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
}

export default Payment;
