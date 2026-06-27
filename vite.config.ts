import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

const EXTERNAL_PKGS = new Set([
  // 框架核心 — 消费方必须提供
  "vue", "vue-router", "pinia",
  // 项目本地虚拟路径，由消费方按自身项目结构解析
  "@tmom/asyncRoutes",
  // UI 框架 & 图标
  "ant-design-vue", "@ant-design/icons-vue",
  "@iconify/vue", "@iconify-json/ep", "@iconify-json/ant-design",
  // 通信 & 数据
  "axios", "@microsoft/signalr",
  // 工具库
  "@vueuse/core", "vue-i18n", "vue-virtual-scroller",
  "dayjs", "lodash-es", "mitt", "echarts",
  // 编辑器
  "tinymce", "@tinymce/tinymce-vue", "codemirror",
  // 图编辑
  "@antv/x6", "@antv/x6-plugin-dnd", "@antv/x6-plugin-export",
  "@antv/x6-plugin-keyboard", "@antv/x6-plugin-selection",
  "@antv/x6-plugin-transform", "@antv/x6-vue-shape",
  // 导出 & 图片
  "xlsx", "cropperjs",
]);

const ENTRY = resolve(__dirname, "src/index.ts");
const PROJECT_ROOT = resolve(__dirname, "");

export default defineConfig({
  plugins: [
    vue(),
  ],
  build: {
    target: 'es2022',
    lib: {
      entry: ENTRY,
      name: "TmomSharedFrontend",
      formats: ["es"],
      fileName: () => `index.js`,
    },
    rollupOptions: {
      external: (id) => {
        if (id === ENTRY) return false;
        // 本地路径别名
        if (id.startsWith("@/")) return false;
        // 相对路径
        if (id.startsWith("./") || id.startsWith("../")) return false;
        // 绝对路径且位于项目内
        if (id.startsWith(PROJECT_ROOT)) return false;
        // 虚拟模块外部化
        if (id.startsWith("virtual:")) return true;
        // node_modules 下的样式文件由消费方 bundler 处理，不打包进 dist
        if (/^[^./\\]+\.(css|less|scss|sass|styl|stylus)(\?.*)?$/.test(id) || /^[^./\\]+\/.*\.(css|less|scss|sass|styl|stylus)(\?.*)?$/.test(id) || /^[^./\\]+\/.*\/.*\.(css|less|scss|sass|styl|stylus)(\?.*)?$/.test(id)) {
          return true;
        }
        // 已知外部包
        for (const pkg of EXTERNAL_PKGS) {
          if (id === pkg || id.startsWith(`${pkg}/`)) return true;
        }
        // 兜底：未显式列出的第三方依赖打包进 dist，避免消费方解析失败
        return false;
      },
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
        preserveModulesRoot: resolve(__dirname, "src"),
        entryFileNames: 'src/[name].js',
        chunkFileNames: 'src/[name].js',
        assetFileNames: 'src/[name].[ext]',
      },
    },
    outDir: "dist",
    sourcemap: true,
    emptyOutDir: true,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
