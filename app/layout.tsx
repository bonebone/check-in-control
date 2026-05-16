import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Check In Control",
  description: "Remote check-in rule manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
