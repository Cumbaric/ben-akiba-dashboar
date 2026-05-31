import '../styles/globals.css'

export const metadata = {
  title: 'Ben Akiba | Upravljanje rezervacijama',
  description: 'Ben Akiba Comedy Club - Dashboard za upravljanje rezervacijama',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
