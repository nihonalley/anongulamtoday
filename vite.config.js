import {
  defineConfig
} from "vite";

import {
  resolve
} from "path";


export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:
          resolve(
            __dirname,
            "index.html"
          ),

        pantry:
          resolve(
            __dirname,
            "pantry.html"
          ),

        shopping:
          resolve(
            __dirname,
            "shopping.html"
          ),

        admin:
          resolve(
            __dirname,
            "admin.html"
          )
      }
    }
  }
});