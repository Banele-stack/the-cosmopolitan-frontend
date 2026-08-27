import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { Toaster } from "sonner";
import ScrollRestorationManager from "@/components/common/ScrollRestorationManager";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        {/* Google Analytics (GA4) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-4NEHLL13NR"
        />

        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            gtag('js', new Date());

            gtag('config', 'G-4NEHLL13NR', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>

      <body className="bg-white text-black antialiased">
        <ScrollRestorationManager />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}