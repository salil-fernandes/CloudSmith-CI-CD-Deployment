import { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@launchboard/components/providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
