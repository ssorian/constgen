import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Escuela Normal de Sultepec",
  description: "Página oficial de la Escuela Normal de Sultepec.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/png" href="/Img/LOGO.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
