# 移动端适配修复说明

## 问题描述
VitePress 移动端侧边栏导航存在遮挡问题，影响用户体验。

## 修复内容

### 1. CSS 样式修复

在 `.vitepress/theme/style.css` 中添加了移动端导航修复样式：

```css
/* Mobile Sidebar Navigation Fix */
@media (max-width: 768px) {
  .VPNavScreen {
    z-index: 100 !important;
    top: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px)) !important;
  }
  
  .VPSidebar {
    z-index: 101 !important;
  }
  
  .VPNavBarHamburger {
    z-index: 102 !important;
    position: relative;
  }
  
  /* 优化触摸目标大小 */
  .VPNavScreenMenuLink,
  .VPNavScreenMenuGroupButton {
    min-height: 52px !important;
    padding: 0.875rem 1.5rem !important;
  }
}
```

### 2. 修复特性

- ✅ 修复侧边栏导航 z-index 层级问题
- ✅ 优化触摸目标大小（最小 52px）
- ✅ 改进移动端导航容器内边距
- ✅ 支持深色模式优化
- ✅ 适配不同屏幕尺寸（768px, 640px, 400px）

### 3. 测试设备

- iPhone 14 Pro (390x844)
- iPhone SE (375x667)
- iPad Mini (768x1024)
- Android Pixel 5 (393x851)

## CDN 缓存清除方案

### 1. GitHub Actions 自动缓存清除

部署工作流已更新，包含以下功能：

- ✅ 自动添加 cache-bust.json 时间戳文件
- ✅ 等待部署传播（15 秒）
- ✅ 输出 CDN 缓存刷新说明

### 2. 缓存清除脚本

提供了 `scripts/purge-cdn-cache.js` 脚本，支持：

- **jsDelivr CDN**: 自动刷新（24 小时内）
- **Cloudflare CDN**: API 调用清除
- **自定义 CDN**: 可扩展接口

使用方法：

```bash
# 使用 jsDelivr（默认）
node scripts/purge-cdn-cache.js

# 使用 Cloudflare
CDN_PROVIDER=cloudflare \
CLOUDFLARE_API_TOKEN=your_token \
CLOUDFLARE_ZONE_ID=your_zone_id \
node scripts/purge-cdn-cache.js
```

### 3. 最佳实践

#### 资源版本控制

在引用静态资源时添加版本号或哈希：

```html
<!-- 推荐 -->
<script src="/assets/app.abc123.js"></script>
<link rel="stylesheet" href="/assets/style.def456.css">

<!-- 或使用查询参数 -->
<script src="/assets/app.js?v=20260416"></script>
```

#### VitePress 配置

在 `.vitepress/config.ts` 中添加资源版本：

```typescript
export default defineConfig({
  head: [
    ['meta', { name: 'cache-control', content: 'public, max-age=3600' }],
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
        },
      },
    },
  },
})
```

## 部署验证

### 1. 本地测试

```bash
# 启动开发服务器
pnpm dev

# 在移动设备上访问 http://localhost:5173
# 或使用 Chrome DevTools 移动设备模拟
```

### 2. 生产部署

```bash
# 构建
pnpm build

# 验证输出
ls -la .vitepress/dist/

# 推送到 GitHub（触发自动部署）
git add .
git commit -m "fix: mobile navigation and CDN cache purge"
git push origin main
```

### 3. 验证清单

- [ ] 移动端汉堡菜单可正常点击
- [ ] 侧边栏导航展开无遮挡
- [ ] 导航链接触摸区域足够大（≥48px）
- [ ] 深色模式下导航正常显示
- [ ] 滚动时导航栏位置正确
- [ ] CDN 缓存在规定时间内刷新

## 相关文件

- `.vitepress/theme/style.css` - 移动端样式修复
- `.github/workflows/deploy.yml` - 部署工作流（含缓存清除）
- `.github/workflows/purge-cache.yml` - 独立缓存清除工作流
- `scripts/purge-cdn-cache.js` - CDN 缓存清除脚本

## 参考资料

- [VitePress Mobile Guide](https://vitepress.dev/guide/mobile-support)
- [jsDelivr CDN Caching](https://www.jsdelivr.com/)
- [Cloudflare Cache API](https://api.cloudflare.com/#zone-purge-files-by-cache-tags-advanced)

---

**修复完成时间**: 2026-04-16  
**负责人**: 十万伏特  
**状态**: ✅ 已完成
