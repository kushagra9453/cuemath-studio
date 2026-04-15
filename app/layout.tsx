import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuemath Social Studio",
  description: "Turn ideas into beautiful social media creatives",
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