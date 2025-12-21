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
  title: "onchain.warden",
  description:
    "Track smart contract events across multiple chains and get instant alerts",
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
