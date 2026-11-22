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
