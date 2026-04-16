import type { Metadata } from "next";
import { IBM_Plex_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { Web3Providers } from "@/components/providers/Web3Providers";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ibm = IBM_Plex_Mono({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://power-grid-sim.vercel.app";
const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? "69e0835f4311569d223694c7";

export const metadata: Metadata = {
  title: "Power Grid Sim",
  description:
    "Cyberpunk grid puzzle on Base — route neon plasma from reactors to every substation.",
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content={baseAppId} />
        <link rel="icon" href="/app-icon.jpg" type="image/jpeg" />
        <meta
          property="og:image"
          content={new URL("/app-thumbnail.jpg", siteUrl).toString()}
        />
      </head>
      <body
        className={`${orbitron.variable} ${ibm.variable} min-h-screen antialiased`}
      >
        <Web3Providers>
          <div className="cyber-bg scanlines min-h-screen">
            <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center px-3 pb-16 pt-2">
              {children}
            </div>
          </div>
        </Web3Providers>
      </body>
    </html>
  );
}
