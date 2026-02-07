import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homeal - Chef Dashboard",
  description: "Manage your kitchen, menus, and orders on Homeal",
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
