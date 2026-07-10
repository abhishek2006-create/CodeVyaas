import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { WebsiteThemeProvider} from "@/components/providers/WebsiteThemeProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import ClerkThemeProvider from "@/components/providers/ClerkThemeProvider";


const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
  description: "Share and run code snippets",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-200`}
      >
        {/* Background Blobs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-pink-500/5 blur-[100px] rounded-full animate-pulse delay-1000" />
        </div>

        <WebsiteThemeProvider>
          <ClerkThemeProvider publishableKey={clerkPublishableKey}>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkThemeProvider>
        </WebsiteThemeProvider>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}

// https://emkc.org/api/v2/piston/runtimes
