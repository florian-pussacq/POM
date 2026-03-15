import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "POM – Plan, Organize & Manage",
  description: "Application de gestion de projets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-gray-50" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
