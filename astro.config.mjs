import { defineConfig, passthroughImageService } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true, // exposes D1/KV/R2 bindings during `astro dev`
    },
  }),
  image: {
    service: passthroughImageService(),
  },
});
