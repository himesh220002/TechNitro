import { Inter, Poppins } from "next/font/google"
import "./../styles/globals.css"
import ClientWrapper from '@/components/ClientWrapper'
import { metadata } from './metadata'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export { metadata }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  )
}
