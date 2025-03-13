import { Link } from "react-router-dom";
import { connectWallet } from "../utils/wallet";
import logo from "../assets/logo.png"; // Ensure the path is correct
import "./Navbar.css"; // ✅ Import Navbar CSS

function Navbar({ walletAddress, setWalletAddress }) {
  // ✅ Handle Wallet Connection
  const handleConnectWallet = async () => {
    const wallet = await connectWallet();
    if (wallet) {
      setWalletAddress(wallet.address);
    }
  };

  // ✅ Handle Wallet Disconnection
  const handleDisconnectWallet = () => {
    setWalletAddress("");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black px-4 shadow-lg">
      <div className="container-fluid">
        {/* ✅ Logo & Name (Left) */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src={logo} alt="Logo" className="logo me-2" style={{ width: "180px", height: "auto" }} />
        </Link>

        {/* ✅ Toggle Button for Mobile View */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* ✅ Navbar Content */}
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          {/* ✅ Navigation Links (Centered) */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link custom-button-1 account-btn">🏠 Account</Link>
            </li>
            <li className="nav-item">
              <Link to="/invoicing" className="nav-link custom-button-1 invoices-btn">📜 Invoices</Link>
            </li>
            <li className="nav-item">
              <Link to="/payments" className="nav-link custom-button-1 payment-btn">💳 Payments</Link>
            </li>
          </ul>
        </div>

        {/* ✅ Wallet Connection (Right Side) */}
        <div className="d-flex flex-column align-items-end">
          {walletAddress ? (
            <>
              <button
                onClick={handleDisconnectWallet}
                className="btn btn-danger fw-bold"
              >
                Disconnect
              </button>
              <span className="text-warning fw-bold mt-1">
                ✅ {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </>
          ) : (
            <>
              <button
                onClick={handleConnectWallet}
                className="btn btn-warning fw-bold"
              >
                Connect Wallet
              </button>
              <span className="text-light mt-1 small">⚠️ Not connected</span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;




