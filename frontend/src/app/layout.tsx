import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedFlow AI — Clinical Intelligence Platform",
  description: "Next-generation AI-powered Clinical Decision Support System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans min-h-screen" style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
