export default function UpgradePage() {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh", 
      fontFamily: "sans-serif" 
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Upgrade to Elite 🚀</h1>
      <p style={{ marginBottom: "2rem" }}>Unlock the full power of Recruit IQ.</p>
      
      {/* GOAL: Get users to checkout. 
         ACTION: Paste your Stripe or Clerk Payment Link in the href below.
      */}
      <a 
        href="https://dashboard.clerk.com" 
        target="_blank"
        rel="noopener noreferrer"
        style={{ 
          padding: "15px 30px", 
          backgroundColor: "#0070f3", 
          color: "white", 
          borderRadius: "8px", 
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "1.2rem"
        }}
      >
        Click to Upgrade
      </a>
      
      <p style={{ marginTop: "20px", fontSize: "0.8rem", color: "#666" }}>
        Secure payment processed by Stripe
      </p>
    </div>
  );
}
