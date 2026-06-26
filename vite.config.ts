import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "UsethinkSharedFrontend",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "vue",
        "vue-router",
        "pinia",
        "axios",
        "dayjs",
        "lodash-es",
        "mitt",
        "echarts",
        "@ant-design/icons-vue",
        "@ant-design/icons-vue/es/icons",
        "ant-design-vue",
        "ant-design-vue/es",
        "@vueuse/core",
        "vue-i18n",
        "@microsoft/signalr",
        "crypto-js",
        "nprogress",
        "nprogress/css/nprogress.css",
        "qs",
        "sortablejs",
        "file-saver",
        "xlsx",
        "@tmom/asyncRoutes",
        "@iconify/vue",
        "@iconify-json/ep",
        "@iconify-json/ant-design",
        "vue-virtual-scroller"
      ],
      output: {
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
          pinia: "Pinia",
          axios: "axios",
          dayjs: "dayjs",
          "lodash-es": "_",
          mitt: "mitt",
          echarts: "echarts",
          "@ant-design/icons-vue": "AntDesignIconsVue",
          "ant-design-vue": "AntDesignVue",
          "@vueuse/core": "VueUse",
          "vue-i18n": "VueI18n",
          "@microsoft/signalr": "signalR",
        },
        preserveModules: true,
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
      },
    },
    outDir: "dist",
    sourcemap: false,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
