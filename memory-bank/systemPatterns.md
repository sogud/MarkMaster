# 系统架构与模式

## 技术决策
1. **前端框架**：React + TypeScript
2. **状态管理**：Hooks（useState, useDragDrop）
3. **数据存储**：浏览器localStorage
4. **UI库**：自定义组件 + TailwindCSS
5. **构建工具**：Webpack + Babel

## 设计模式
- 单向数据流：组件通过props传递数据
- 高阶组件（HOC）：封装公共功能（如拖拽逻辑）
- 依赖注入：通过props提供外部服务（如数据存储）

## 组件关系图
```mermaid
graph TD
    A[BookmarksList] -->|包含| B[SortableItem]
    B --> C[BookmarkForm]
    A --> D[SearchBar]
    E[StorageService] -->|提供数据| A
