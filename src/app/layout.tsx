import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import ClerkThemeProvider from "@/components/providers/ClerkThemeProvider";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CodeVyaas",
  description: "Practice algorithms, run code, and build web projects in the CodeVyaas online IDE.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} font-sans dark`}>
      <body
        className="antialiased min-h-screen bg-background text-foreground transition-colors duration-200"
      >
        <ClerkThemeProvider publishableKey={clerkPublishableKey}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkThemeProvider>
        <Footer />
        <Toaster toastOptions={{ style: { background: "var(--popover)", color: "var(--foreground)", border: "1px solid var(--border)" } }} />
      </body>
    </html>
  );
}

// https://emkc.org/api/v2/piston/runtimes
