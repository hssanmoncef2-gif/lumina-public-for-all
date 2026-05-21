import type { Metadata, Viewport } from 'next'
import { Sora, Nunito } from 'next/font/google'
import '@/styles/globals.css'
import ToastProvider from '@/components/ui/Toast'
import ServiceWorkerRegistrar from '@/components/ui/ServiceWorkerRegistrar'
import Providers from '@/components/ui/Providers'

const sora = Sora({
  subsets: ['latin'], weight: ['300', '400', '500', '600'],
  variable: '--font-sora', display: 'swap',
})
const nunito = Nunito({
  subsets: ['latin'], weight: ['200', '300', '400', '500'],
  variable: '--font-nunito', display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lumina — Your Emotional Sanctuary',
  description: 'A dreamy emotional support space that feels, adapts, and cares.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Lumina', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icons/icon-192x192.png', apple: '/icons/icon-192x192.png' },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1,
  userScalable: false, themeColor: '#0a0812',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${nunito.variable}`}>
      <body>
        <Providers>
          <ToastProvider />
          <ServiceWorkerRegistrar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
