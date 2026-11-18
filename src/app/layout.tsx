import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Britech Solutions | Driven by Innovation. Powered by Technology",
    template: "%s | Britech Solutions",
  },
  description:
    "Britech Solutions is a Tanzania-based multidisciplinary professional services and technology company: engineering consultancy, digital transformation and business advisory, integrated.",
  icons: {
    icon: [
      { url: "/images/favicon.svg", type: "image/svg+xml" },
      { url: "/images/mark.png", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
  openGraph: {
    title: "Britech Solutions",
    description: "One Britech. Three practices. Integrated solutions: engineering, technology and business consultancy from Arusha, Tanzania.",
    locale: "en_TZ",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
