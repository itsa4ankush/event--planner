import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anthea — AI Event Planning",
  description: "Multi-agent AI system that turns a vague event idea into a fully planned experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
