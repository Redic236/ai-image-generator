# AI 图片生成器技术架构文档

## 技术栈选择

### 前端技术
- **框架**: React 18+
- **语言**: TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **状态管理**: React Context API + useReducer
- **HTTP 客户端**: Axios
- **本地存储**: localStorage (用于保存生成历史)

### 后端技术
- **服务类型**: 无后端服务，直接调用智谱AI API
- **API 集成**: 智谱AI图片生成API

### 数据库
- **存储方式**: 本地存储 (localStorage)
- **数据持久化**: 浏览器本地存储，用于保存生成历史

## 项目结构

```
/src
  /components
    /common
      Button.tsx
      Input.tsx
      Select.tsx
    /ImageGenerator
      ImageGenerator.tsx
      PromptOptimizer.tsx
      ImageDisplay.tsx
      HistorySidebar.tsx
  /hooks
    useImageGenerator.ts
    usePromptOptimizer.ts
    useHistory.ts
  /services
    api.ts (智谱AI API 调用)
  /types
    index.ts (TypeScript 类型定义)
  /utils
    storage.ts (本地存储工具)
  /context
    AppContext.tsx (全局状态管理)
  App.tsx
  main.tsx
  index.css
```

## 数据模型

### 生成历史记录
```typescript
interface ImageHistoryItem {
  id: string;          // 唯一标识符
  prompt: string;      // 图片描述
  optimizedPrompt?: string; // 优化后的描述
  size: string;        // 图片尺寸
  style: string;       // 图片风格
  imageUrl: string;    // 生成的图片URL
  createdAt: number;   // 生成时间戳
}
```

### 生成参数
```typescript
interface GenerateParams {
  prompt: string;      // 图片描述
  size: string;        // 图片尺寸
  style: string;       // 图片风格
}
```

## 关键技术点

### 1. 智谱AI API 集成
- **技术难点**: API 调用的认证和错误处理
- **解决方案**: 使用 Axios 封装 API 调用，处理认证、超时和错误情况
- **实现要点**:
  - 配置 API 密钥和请求参数
  - 处理长时间的生成过程（10-30秒）
  - 实现重试机制，应对网络不稳定情况

### 2. 生成过程的用户体验
- **技术难点**: 长时间生成过程中的用户体验
- **解决方案**: 实现加载动画和进度提示
- **实现要点**:
  - 使用 React 状态管理生成状态
  - 设计美观的加载动画
  - 提供取消生成的功能

### 3. 历史记录管理
- **技术难点**: 本地存储的管理和性能优化
- **解决方案**: 使用 localStorage 存储历史记录，实现分页加载
- **实现要点**:
  - 限制存储数量，防止本地存储过大
  - 实现历史记录的增删查操作
  - 优化历史记录的渲染性能

### 4. 提示词优化功能
- **技术难点**: 调用 AI API 进行提示词优化
- **解决方案**: 单独封装提示词优化 API 调用
- **实现要点**:
  - 设计优化提示词的请求参数
  - 处理优化过程的状态管理
  - 优化结果的展示和应用

### 5. 图片下载功能
- **技术难点**: 实现图片的本地下载
- **解决方案**: 使用 canvas 或直接下载链接
- **实现要点**:
  - 处理跨域图片的下载问题
  - 确保下载的图片质量
  - 提供多种下载格式选项

### 6. 响应式设计
- **技术难点**: 适配不同屏幕尺寸
- **解决方案**: 使用 Tailwind CSS 的响应式类
- **实现要点**:
  - 设计移动端友好的布局
  - 优化侧边栏在小屏幕上的显示
  - 确保关键功能在所有设备上可用

## 技术实现路径

1. **项目初始化**:
   - 使用 Vite 创建 React + TypeScript 项目
   - 配置 Tailwind CSS

2. **核心功能实现**:
   - 实现图片生成 API 调用
   - 实现提示词优化功能
   - 实现历史记录管理

3. **UI 组件开发**:
   - 开发输入组件
   - 开发图片展示组件
   - 开发历史记录组件

4. **状态管理**:
   - 使用 Context API 管理全局状态
   - 实现生成过程的状态管理

5. **性能优化**:
   - 优化 API 调用
   - 优化渲染性能
   - 优化本地存储管理

6. **测试与部署**:
   - 进行功能测试
   - 进行性能测试
   - 部署到静态网站托管服务