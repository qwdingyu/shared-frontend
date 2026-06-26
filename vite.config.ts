import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
      outDir: "dist",
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "UsethinkSharedFrontend",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      // 外部化所有不应打包的依赖
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
        "qs",
        "sortablejs",
        "file-saver",
        "xlsx",
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
        // 保留模块结构
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
    outDir: "dist",
    sourcemap: true,
    // 清空输出目录
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
