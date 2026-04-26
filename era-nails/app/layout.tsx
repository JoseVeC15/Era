import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Era Nails & Hair - Especialistas en Plástica de Pies Brasileña en Asunción',
  description: 'Era Nails & Hair Home Spa: Expertos en Plástica de Pies Brasileña Original, uñas acrílicas, gel y polygel en Fernando de la Mora, Asunción.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
