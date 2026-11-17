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
    "Britech Solutions builds smart, secure, and scalable digital systems for businesses, governments, and organizations in Tanzania, Africa and beyond.",
  icons: { icon: "/images/mark.png", apple: "/images/mark.png" },
  openGraph: {
    title: "Britech Solutions",
    description: "Innovative technology solutions for businesses, governments, and organizations in Africa and beyond.",
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
