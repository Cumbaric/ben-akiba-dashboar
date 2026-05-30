import '../styles/globals.css'

export const metadata = {
  title: 'Ben Akiba | Upravljanje rezervacijama',
  description: 'Ben Akiba Comedy Club - Dashboard za upravljanje rezervacijama',
}

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  )
}
