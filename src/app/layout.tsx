import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Armonía - Sistema de Administración de Conjuntos Residenciales',
    template: '%s | Armonía'
  },
  description: 'Plataforma integral para la gestión de conjuntos residenciales. Administra propiedades, residentes, finanzas, asambleas y servicios comunes desde una sola aplicación.',
  keywords: ['conjunto residencial', 'administración', 'propiedades', 'saas', 'gestión residencial'],
  authors: [{ name: 'MiniMax Agent' }],
  creator: 'MiniMax Agent',
  publisher: 'Armonía',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: '/',
    siteName: 'Armonía',
    title: 'Armonía - Sistema de Administración de Conjuntos Residenciales',
    description: 'Transforma la gestión residencial con tecnología avanzada',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Armonía - Gestión Residencial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Armonía - Sistema de Administración de Conjuntos Residenciales',
    description: 'Transforma la gestión residencial con tecnología avanzada',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#4f46e5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Armonía",
              "url": process.env.NEXTAUTH_URL || "http://localhost:3000",
              "logo": `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/logo.png`,
              "description": "Sistema integral de administración de conjuntos residenciales",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Ventas",
                "email": "ventas@armonia.com"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
