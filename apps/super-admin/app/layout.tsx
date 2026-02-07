import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homeal - Super Admin",
  description: "Homeal platform management and administration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
