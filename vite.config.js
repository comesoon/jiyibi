import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  // 项目根目录，Vite 将在这里寻找 index.html
  root: 'public',
  
  // 构建输出目录，相对于 root
  build: {
    outDir: '../dist',
    // 清空构建目录
    emptyOutDir: true,
  },

  server: {
    // 为后端 API 设置代理
    proxy: {
      // 将所有 /api 开头的请求代理到后端服务
      '/api': {
        target: 'http://127.0.0.1:5000', // 后端服务器地址
        changeOrigin: true, // 必须设置为 true，以正确处理代理
      },
    },
  },

  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'locales',
          dest: '.'
        }
      ]
    })
  ]
});
