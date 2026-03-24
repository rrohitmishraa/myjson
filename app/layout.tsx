import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mysjon.unlinkly.com"),

  title: {
    default: "MyJSON – Google Sheets to JSON API",
    template: "%s | MyJSON",
  },

  description:
    "Convert Google Sheets into a live JSON API instantly. No backend, no setup. Just paste your sheet link and get your API.",

  keywords: [
    "google sheets to json",
    "google sheets api",
    "sheet to json api",
    "json api generator",
    "convert google sheet to api",
    "no backend api tool",
  ],

  authors: [{ name: "MyJSON" }],
  creator: "MyJSON",

  alternates: {
    canonical: "https://mysjon.unlinkly.com",
  },

  openGraph: {
    title: "MyJSON – Google Sheets to JSON API",
    description:
      "Turn any Google Sheet into a live JSON API instantly. No backend required.",
    url: "https://mysjon.unlinkly.com",
    siteName: "MyJSON",
    images: [
      {
        url: "https://mysjon.unlinkly.com/logo.png",
        width: 1200,
        height: 630,
        alt: "MyJSON – Google Sheets to JSON API",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "MyJSON – Google Sheets to JSON API",
    description:
      "Convert Google Sheets into a JSON API instantly.",
    images: ["https://mysjon.unlinkly.com/logo.png"],
  },

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  manifest: "/manifest.json",

  viewport: {
    width: "device-width",
    initialScale: 1,
  },

  themeColor: "#07070a",

  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  verification: {
    google: "",
    other: {
      bing: "",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07070a] text-white">
        {children}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "MyJSON",
              url: "https://mysjon.unlinkly.com",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "All",
              description:
                "Convert Google Sheets into a live JSON API instantly.",
            }),
          }}
        />
      </body>
    </html>
  );
}