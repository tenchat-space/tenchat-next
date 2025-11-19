import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TenchatThemeProvider } from "@/components/providers/TenchatThemeProvider";
import { AppwriteProvider } from "@/contexts/AppwriteContext";
import { ContextMenuProvider } from "@/contexts/ContextMenuContext";
import { AnimationProvider } from "@/contexts/AnimationContext";
import { StyleProvider } from "@/contexts/StyleContext";
import { WindowSystem } from "@/components/window/WindowSystem";

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
        <StyleProvider>
          <TenchatThemeProvider>
            <AnimationProvider>
              <AppwriteProvider>
                <ContextMenuProvider>
                  <WindowSystem>
                    {children}
                  </WindowSystem>
                </ContextMenuProvider>
              </AppwriteProvider>
            </AnimationProvider>
          </TenchatThemeProvider>
        </StyleProvider>
      </body>
    </html>
  );
}
