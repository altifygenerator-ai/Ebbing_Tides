import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ebbing Tides — Alpha 0.1",
  description: "Early vertical-slice alpha for Ebbing Tides."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
