import type { Metadata } from "next";
import "@repo/ui/globals.css"
import ConditionalNavbar from "@/components/conditional-navbar";
import { AuthProvider } from "@/contexts/auth-context";
import { getInitialAuthState } from "@/lib/auth";
import GlobalFontLoader from "@/components/GlobalFontLoader";

export const metadata: Metadata = {
  title: "Tonic Flow - Modern Tonic Solfa Notation Software",
  description: "Create, edit, and share beautiful tonic solfa sheet music with our intuitive text-based editor and professional engraving engine. The modern solution for tonic solfa notation.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialAuthState = await getInitialAuthState();

  return (
    <html lang="en">
      <body className='font-sans antialiased' suppressHydrationWarning={true}>
        <GlobalFontLoader />
        <AuthProvider initialAuthState={initialAuthState}>
          <ConditionalNavbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
