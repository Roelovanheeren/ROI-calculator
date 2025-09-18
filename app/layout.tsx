import type { Metadata } from 'next'
import { Raleway } from 'next/font/google'
import './globals.css'

const raleway = Raleway({ 
  subsets: ['latin'],
  variable: '--font-raleway',
})

// Red Rose is now loaded locally from /public/fonts/

export const metadata: Metadata = {
  title: 'Barn Gym ROI Calculator - Calculate Your Corporate Wellness Investment Return',
  description: 'Calculate the ROI of corporate wellness programs. Get personalized reports showing potential savings from reduced absenteeism, turnover, and healthcare costs.',
  keywords: 'corporate wellness, ROI calculator, employee wellness, workplace health, business case, cost savings',
  authors: [{ name: 'Barn Gym' }],
  openGraph: {
    title: 'Barn Gym ROI Calculator',
    description: 'Calculate the ROI of corporate wellness programs and get a detailed business case report.',
    type: 'website',
    url: 'https://tools.barn-gym.com',
    images: [
      {
        url: 'https://res.cloudinary.com/dlsvq9des/image/upload/v1753153130/Barn_Gym_Logo_transparent_jxvivr.png',
        width: 1200,
        height: 630,
        alt: 'Barn Gym ROI Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barn Gym ROI Calculator',
    description: 'Calculate the ROI of corporate wellness programs and get a detailed business case report.',
    images: ['https://res.cloudinary.com/dlsvq9des/image/upload/v1753153130/Barn_Gym_Logo_transparent_jxvivr.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
