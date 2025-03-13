import { BrowserProvider } from "ethers";

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("MetaMask is required!");
    return null;
  }

  try {
    // Force MetaMask to prompt account selection
    await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    console.log("Connected wallet:", address);
    return { provider, signer, address };
  } catch (error) {
    console.error("Wallet connection error:", error);
    alert("Failed to connect wallet. Check console for details.");
    return null;
  }
};


