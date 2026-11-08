import "./globals.css";
import { htmlClassName } from "./fonts";
import NotFound from "./not-found";

// Unmatched URLs render here, outside every layout. The marketing layout reads
// Clerk's auth(), which throws on URLs the proxy's matcher skips (scanners ask
// for `/next.config.js.bak`, `/.dockerignore`, `/_next/data/...`), so a 404
// rendered inside it became a 500 on the Worker.

// Same head as a 404 inside the root layout, which is what Next served on Vercel.
export { metadata } from "./layout";

export default function GlobalNotFound() {
  return (
    <html lang="en" className={htmlClassName}>
      <body className="min-h-full flex flex-col">
        <NotFound />
      </body>
    </html>
  );
}
