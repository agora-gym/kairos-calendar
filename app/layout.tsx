import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Kairos Calendar',
  description: 'A small calendar for practicing intentional teamwork.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.ReactNode {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
