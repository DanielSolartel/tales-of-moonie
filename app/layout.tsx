import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tales of Moonie · Un pequeño cuento bajo la luna",
  description: "Un pequeño cuento interactivo bajo la luna.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
