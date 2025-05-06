import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTC Price Tomorrow",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>BTC Price Tomorrow</title>
        <meta name="description" content="Get the Bitcoin price prediction for tomorrow. Updated daily at 00:00" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
