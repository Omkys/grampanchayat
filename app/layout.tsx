import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "ग्रामपंचायत बावी | Gram Panchayat Bavi",
  description: "Official website of Gram Panchayat Bavi, Maharashtra",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
