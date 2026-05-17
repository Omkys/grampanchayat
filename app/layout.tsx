import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "ग्रामपंचायत बावी | Grampanchayat Bavi",
  description: "Official website of Grampanchayat Bavi, Maharashtra",
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
