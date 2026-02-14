import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Love Blooms Florist | Luxury Flower Delivery UK',
    template: '%s | Love Blooms Florist',
  },
  description:
    'Hand-crafted luxury floral arrangements delivered across the UK. Same-day delivery available. Premium roses, bouquets & plants for every occasion.',
  keywords: [
    'flower delivery',
    'florist UK',
    'luxury flowers',
    'same day flower delivery',
    'roses',
    'bouquets',
    'wedding flowers',
    'sympathy flowers',
    'birthday flowers',
    'flower subscription',
  ],
  authors: [{ name: 'Love Blooms Florist' }],
  creator: 'Love Blooms Florist',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: '/',
    siteName: 'Love Blooms Florist',
    title: 'Love Blooms Florist | Luxury Flower Delivery UK',
    description:
      'Hand-crafted luxury floral arrangements delivered across the UK. Same-day delivery available.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Love Blooms Florist - Luxury Flower Delivery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Love Blooms Florist | Luxury Flower Delivery UK',
    description:
      'Hand-crafted luxury floral arrangements delivered across the UK.',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
