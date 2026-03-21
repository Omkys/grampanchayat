import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "ग्रामपंचायत जावळके | Grampanchayat Jawalke",
  description: "Official website of Gram Panchayat Jawalke, Tal. Jamkhed, Dist. Ahilyanagar, Maharashtra",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mr">
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
