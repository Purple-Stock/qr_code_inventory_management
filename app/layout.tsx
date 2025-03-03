import "@/styles/globals.css"
import type { Metadata, Viewport } from "next"
import type React from "react"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { LanguageProvider } from "@/contexts/language-context"
import { MainHeader } from "@/components/main-header"
import { SessionProvider } from "@/components/session-provider"
import { SessionGuard } from "@/components/session-guard"
import { SessionExpiryHandler } from "@/components/session-expiry-handler"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor.dark },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content={siteConfig.name} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={siteConfig.name} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content={siteConfig.themeColor.light} />
      </head>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          "bg-gradient-to-b from-background to-background/80",
          "dark:from-background dark:to-background/50",
          fontSans.variable,
        )}
      >
        <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <SessionProvider>
              <SidebarProvider>
                <div className="relative flex min-h-screen flex-col">
                  <MainHeader />
                  <div className="flex-1 pt-16">
                    <SessionGuard>
                      {children}
                      <SessionExpiryHandler />
                    </SessionGuard>
                  </div>
                </div>
              </SidebarProvider>
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}



import './globals.css'