import type { Metadata } from "next";
import "@repo/ui/globals.css"
import { JetBrains_Mono } from "next/font/google";
import ConditionalNavbar from "@/components/conditional-navbar";
import { AuthProvider } from "@/contexts/auth-context";
import { getInitialAuthState } from "@/lib/auth";
import GlobalFontLoader from "@/components/GlobalFontLoader";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Tonic Flow - Modern Tonic Solfa Notation Software",
  description: "Create, edit, and share beautiful tonic solfa sheet music with our intuitive text-based editor and professional engraving engine. The modern solution for tonic solfa notation.",
};

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialAuthState = await getInitialAuthState();

  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <GlobalFontLoader />
        <AuthProvider initialAuthState={initialAuthState}>
          <Toaster position="top-right" richColors />
          <ConditionalNavbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
