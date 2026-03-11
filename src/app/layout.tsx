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
  title: "Bay Area Events — Your Local Event Concierge",
  description:
    "Discover curated events in the South Bay and greater Bay Area. Arts, comedy, live music, workshops, and more — personalized to your interests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-card-border">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <a href="/" className="text-lg font-bold text-foreground">
              Bay Area Events
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/" className="text-muted hover:text-foreground transition-colors">
                Home
              </a>
              <a href="/events" className="text-muted hover:text-foreground transition-colors">
                Browse
              </a>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
