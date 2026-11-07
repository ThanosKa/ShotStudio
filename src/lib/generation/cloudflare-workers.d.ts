// Only the part of the Images binding this app uses. The full Workers types
// replace the DOM `Response` across the whole project, so they stay out of tsconfig.
declare module "cloudflare:workers" {
  export const env: {
    IMAGES: {
      input(stream: ReadableStream<Uint8Array>): {
        transform(options: { width: number; height: number; fit: "cover" }): {
          output(options: { format: "image/png" }): Promise<{ response(): Response }>;
        };
      };
    };
  };
}
