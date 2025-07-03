import './globals.css'

export const metadata = {
  title: 'Code Sharing App',
  description: 'Share and format code across devices',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
