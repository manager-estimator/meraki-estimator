import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Meraki Sign Up",
  description: "Sign up to Meraki",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
<style>
          {`
            @font-face {
              font-family: "PP Neue Montreal";
              src: url("https://cdn.builder.io/o/assets%2Fd94fa6e5f0634242979e8f5a4b8f636a%2F133275572bd4417faa094d60e8405c38?alt=media&token=46a432e0-d75d-4adb-a636-7e3eecc6b7f0&apiKey=d94fa6e5f0634242979e8f5a4b8f636a");
              font-weight: 375;
              font-style: normal;
            }
          `}
        </style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
