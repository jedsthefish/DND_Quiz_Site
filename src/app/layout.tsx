import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Which D&D Class Are You?",
  description: "Discover the D&D class that matches your adventuring spirit.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
