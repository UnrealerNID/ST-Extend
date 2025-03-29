import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 配置构建选项
  build: {
    // 输出目录设置为dist
    outDir: "dist",
    // 确保生成的资源使用相对路径
    assetsDir: "assets",
    // 将CSS提取到单独的文件中
    cssCodeSplit: true,
    // 减小构建体积
    minify: "terser",
    // 配置Rollup选项
    rollupOptions: {
      output: {
        // 确保生成的文件名不会包含哈希值，便于引用
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
      // 指定入口文件，不使用HTML
      input: {
        index: resolve(__dirname, "src/main.js"),
      },
    },
  },
  // 设置基础路径为相对路径
  base: "./",
  // 解析配置
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // 开发服务器配置
  server: {
    // 允许跨域访问
    cors: true,
    // 设置响应头，允许跨域脚本访问
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
});
