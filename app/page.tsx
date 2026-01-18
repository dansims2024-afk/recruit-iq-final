import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  // If already logged in, go straight to the dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh", 
      fontFamily: "sans-serif",
      textAlign: "center",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "20px" }}>
        Recruit IQ
      </h1>
      <p style={{ fontSize: "1.5rem", color: "#666", marginBottom: "40px" }}>
        AI-Powered Recruitment Tools
      </p>
      
      <Link 
        href="/dashboard" 
        style={{ 
          padding: "15px 30px", 
          backgroundColor: "#000", 
          color: "white", 
          borderRadius: "8px", 
          textDecoration: "none",
          fontSize: "1.2rem" 
        }}
      >
        Login / Get Started
      </Link>
    </div>
  );
}
