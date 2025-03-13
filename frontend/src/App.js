import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Registration from "./pages/Registration";
import Invoicing from "./pages/Invoicing";
import Payments from "./pages/Payments";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Ensure Bootstrap is imported

function App() {
  const [walletAddress, setWalletAddress] = useState("");

  return (
    <Router>
      {/* ✅ Navbar with Bootstrap */}
      <Navbar walletAddress={walletAddress} setWalletAddress={setWalletAddress} />

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Registration walletAddress={walletAddress} />} />
          <Route path="/invoicing" element={<Invoicing walletAddress={walletAddress} />} />
          <Route path="/payments" element={<Payments walletAddress={walletAddress} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;








