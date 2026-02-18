import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MoonCraft - Online RTS',
  description: 'Real-time strategy game built with Three.js and Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
