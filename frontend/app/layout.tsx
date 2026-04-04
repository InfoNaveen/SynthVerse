import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AntiGravity — Metaverse Forensics SOC",
  description:
    "Decentralized forensics and accountability layer for metaverse digital twins. Real-time threat detection, blockchain-anchored evidence, and gamified agent rewards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-[#e2e8f0] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
