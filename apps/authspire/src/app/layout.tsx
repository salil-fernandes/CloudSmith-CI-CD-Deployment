import "./globals.css";
import { ReactNode } from "react";
import SessionWrapper from "./components/SessionWrapper"; // import your wrapper

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
