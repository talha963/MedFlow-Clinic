import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
