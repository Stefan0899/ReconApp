const { viewAllUserData } = require("./viewAllUserData"); // Replace with actual file name

async function main() {
  const userAddress = "0x5Ab76a41eeC00851002C861E3B3a9CFF134ca526"; // ✅ Replace with actual user address

  console.log("\n🚀 Fetching User Data for Address:", userAddress);
  
  try {
    const data = await viewAllUserData(userAddress);
    console.log("✅ Data Retrieved Successfully");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ✅ Run the script
main();
