import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://ulti.js.org",
  output: "static",
  compressHTML: true,
  markdown: {
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
});
