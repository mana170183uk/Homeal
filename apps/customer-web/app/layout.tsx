import type { Metadata } from "next";
import { Poppins, Fredoka, Pacifico } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fredoka",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

export const metadata: Metadata = {
  title: "Homeal - Homemade Products, From Home",
  description:
    "Discover delicious homemade food, cakes, pickles, masalas, and more from local home chefs near you. Order authentic homemade products delivered to your door.",
  icons: {
    icon: [
      { url: "/favicon-final-2.png?v=7", sizes: "32x32", type: "image/png" },
      { url: "/favicon-final-2.png?v=7", sizes: "48x48", type: "image/png" },
      { url: "/favicon-final-2.png?v=7", sizes: "96x96", type: "image/png" },
      { url: "/favicon-final-2.png?v=7", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/favicon-final-2.png?v=7", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${fredoka.variable} ${pacifico.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body className="pb-16 md:pb-0" suppressHydrationWarning>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
