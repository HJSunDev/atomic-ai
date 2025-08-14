import type { GridItem } from './types';

// 插入子模块的辅助函数（仅支持两级结构）
export function insertChildModule(
  items: GridItem[],
  parentId: string,
  child: GridItem
): GridItem[] {
  // 只在顶层查找目标父模块
  return items.map(item => {
    if (item.id === parentId) {
      // 找到目标父模块，插入子模块到children末尾
      return {
        ...item,
        children: [...item.children, child],
      };
    } else {
      // 其他模块保持不变
      return item;
    }
  });
}

// 在同一父模块内重新排序子模块的辅助函数
export function reorderChildModules(
  items: GridItem[],
  parentId: string,
  childId: string,
  newIndex: number
): GridItem[] {
  return items.map(item => {
    if (item.id === parentId) {
      // 找到目标父模块
      const currentChildren = [...item.children];
      // 找到要移动的子模块
      const childIndex = currentChildren.findIndex(child => child.id === childId);
      if (childIndex !== -1) {
        // 删除原位置的子模块
        const [movedChild] = currentChildren.splice(childIndex, 1);
        // 插入到新位置
        currentChildren.splice(newIndex, 0, movedChild);
        // 返回更新后的父模块
        return {
          ...item,
          children: currentChildren,
        };
      }
    }
    return item;
  });
}


