import "./globals.css";
import { htmlClassName } from "./fonts";
import NotFound from "./not-found";

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
