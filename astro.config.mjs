import { defineConfig } from "astro/config";
import partytown from "@astrojs/partytown";

export default defineConfig({
  site: "https://sunheyi.com",
  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
});