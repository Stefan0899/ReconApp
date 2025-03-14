import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Payments.css";
import { ethers } from "ethers";
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

function Payment({ walletAddress }) {
  const [totalBill, setTotalBill] = useState(null);
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
      setPaymentStatus("");
      setTransactionHash("");
      setPaymentAmount("");
    }
  }, [walletAddress]);

  const handlePayment = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to proceed.");
      return;
    }
  
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
  
    setLoading(true);
    setPaymentStatus("⏳ Fetching total bill...");
  
    try {
      // ✅ Step 1: Connect to Ethereum via MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      const contract = new ethers.Contract(
        "0xB16103De3B577C8384157A7B15660bA97469DBA8", // ✅ Replace with your deployed contract address
        [
          "function userFees(address user) public view returns (uint256, uint256, uint256, uint256, uint256)",
          "function payEnergyFees() public payable",
        ],
        signer
      );
  
      // ✅ Step 2: Fetch all stored values from userFees[_user]
      const fees = await contract.userFees(walletAddress);

      // ✅ Extract the last value (totalBill)
      const totalBill = fees[4]; // `totalBill` is the last value in the struct
      const totalBillInWei = totalBill.toString();
      const totalBillInEther = ethers.formatEther(totalBillInWei);
  
      console.log("💰 Total Bill (ETH):", totalBillInEther);
  
      // ✅ Step 3: Send the transaction to the smart contract
      setPaymentStatus("⏳ Waiting for MetaMask confirmation...");
  
      const tx = await contract.payEnergyFees({
        value: totalBillInWei, // Send exact ETH required
        gasLimit: "300000", // Ensure enough gas
      });
  
      console.log("✅ Transaction sent:", tx.hash);
  
      setPaymentStatus("⏳ Waiting for transaction confirmation...");
      await tx.wait(); // Wait for confirmation
  
      console.log("✅ Payment successful:", tx);
      setTransactionHash(tx.hash);
      setPaymentAmount(totalBillInEther);
  
      setPaymentStatus("✅ Payment Successful!");
  
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      setPaymentStatus("❌ Payment Failed.");
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

            {/* ✅ Pay Button */}
            <h3 className="section-header">💳 Settle Energy Bill</h3>
            <div className="button-container">
              <button
                className="custom-button pay-btn"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Processing..." : "Pay with MetaMask"}
              </button>
            </div>

            {/* ✅ Payment Status */}
            {paymentStatus && <p className="text-center text-warning mt-3">{paymentStatus}</p>}

            {/* ✅ Payment Details Table */}
            {transactionHash && paymentAmount && (
              <div className="mt-4">
                <h3 className="text-center text-success">Payment Details</h3>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Transaction Hash</th>
                        <th>Explore Transaction</th>
                        <th>Amount Paid (ETH)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{transactionHash}</td>
                        <td>
                          <a href={`https://sepolia.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">
                            Explore on Etherscan
                          </a>
                        </td>
                        <td>{Number(paymentAmount).toFixed(4)}</td>
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
