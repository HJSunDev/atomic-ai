/**
 * 卡片数据结构（支持真实 ID + 虚拟 ID ）
 */
export interface GridItem {
  // === 虚拟 ID（前端拖拽体系）===
  // 用于 dnd-kit 的唯一性识别
  // 网格区：virtualId === documentId
  // 操作区：virtualId 为 uuid()，documentId 保留原值
  virtualId: string;
  
  // === 真实 ID（后端业务体系）===
  // 指向后端 documents._id，用于保存时创建引用关系
  documentId: string;
  
  // === 业务字段 ===
  title?: string;
  
  // === 元数据 ===
  description?: string;
  promptPrefix?: string;
  promptSuffix?: string;
  
  // === 层级结构 ===
  // 子模块列表（仅操作区顶层卡片可有子模块）
  children: GridItem[];
}


