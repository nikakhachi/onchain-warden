import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import { Providers } from "./ProvidersClient";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
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
        className={`${poppins.variable} ${roboto.variable}`}
        style={{ backgroundColor: "#030712" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
