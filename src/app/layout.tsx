import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ersatztelstore — Product Search",
  description: "Search spare parts and accessories in real time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
