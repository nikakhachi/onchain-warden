import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./ProvidersClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventFlow - Monitor Blockchain Events Automatically",
  description:
    "Track smart contract events across multiple chains and get instant notifications. Set up event subscriptions in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ backgroundColor: "#030712", color: "#f3f4f6" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
