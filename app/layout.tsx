import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TenchatThemeProvider } from "@/components/providers/TenchatThemeProvider";
import { AppwriteProvider } from "@/contexts/AppwriteContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tenchat",
  description: "Secure, encrypted messaging for Tenchat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <TenchatThemeProvider>
          <AppwriteProvider>{children}</AppwriteProvider>
        </TenchatThemeProvider>
      </body>
    </html>
  );
}
