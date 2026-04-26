import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Era Nails & Hair — Agente IA",
  description: "Agente de WhatsApp para Era Nails & Hair",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/jpeg" href="/logo.jpg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
