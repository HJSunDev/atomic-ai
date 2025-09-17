/**
 * 将各面部可动部位抽象为键，便于在配置层统一维护。
 * 这样做的目的在于通过数据驱动视图，避免在渲染层散落具体坐标与路径细节。
 */
export const faceParts = {
  leftBrow: "leftBrow",
  rightBrow: "rightBrow",
  leftEye: "leftEye",
  rightEye: "rightEye",
  noseBridge: "noseBridge",
  noseTip: "noseTip",
} as const;

/**
 * 默认面部（基线）
 * 该对象作为所有表情的基准，任何新增表情都必须以它为起点进行差异修改。
 * 眼睛使用椭圆形状，便于实现自然的眨眼效果（通过调整垂直半径）
 */
const defaultFace = {
  [faceParts.leftBrow]: { d: "M7.5 8.2 Q9.3 7.2 11.3 7.9" },
  [faceParts.rightBrow]: { d: "M14.3 7.9 Q16.3 7.2 18.3 8.2" },
  [faceParts.leftEye]: { cx: 9.4, cy: 11.5, rx: 1.1, ry: 1.1 },
  [faceParts.rightEye]: { cx: 15.4, cy: 11.5, rx: 1.1, ry: 1.1 },
  [faceParts.noseBridge]: { d: "M12.8 9.5 L9.4 18.2" },
  [faceParts.noseTip]: { d: "M9.4 18.2 L12.4 18.2" },
} as const;

/**
 * 表情字典。
 * 键是表情的名称，值是该表情下所有面部部位的SVG属性集合。
 * 我们首先用您的原始面部数据定义 "neutral" 状态。
 */
export const expressions = {
  // 作为其它表情的基线，确保不同表情之间的差异能被直观感知
  neutral: defaultFace,
  // 用挑眉与轻微眼位与半径变化表达「惊讶」的注意力集中感
  surprised: {
    [faceParts.leftBrow]: { d: "M7.2 8 Q9.3 6.8 11.5 7.6" },
    [faceParts.rightBrow]: { d: "M14.1 7.8 Q16.6 7.1 18.6 8.4" },
    [faceParts.leftEye]: { cx: 9.2, cy: 11.4, rx: 1.0, ry: 1.0 },
    [faceParts.rightEye]: { cx: 15.6, cy: 11.6, rx: 1.0, ry: 1.0 },
    [faceParts.noseBridge]: { d: "M12.8 9.2 L9.3 18.3" },
    [faceParts.noseTip]: { d: "M9.3 18.3 L12.6 18.3" },
  },
  // 眨眼：通过将垂直半径设为极小值来模拟上下眼睑合拢的效果
  blink: {
    ...defaultFace, // 继承所有默认面部属性
    // 保持水平半径不变，将垂直半径设为极小值，实现上下合拢的闭眼效果
    [faceParts.leftEye]: {
      ...defaultFace[faceParts.leftEye], // 继承 cx, cy, rx 属性
      ry: 0.1, // 垂直半径接近0，形成一条细线，模拟闭眼
    },
    [faceParts.rightEye]: {
      ...defaultFace[faceParts.rightEye], // 继承 cx, cy, rx 属性
      ry: 0.1, // 垂直半径接近0，形成一条细线，模拟闭眼
    },
  },
} as const;

// 为组件提供类型约束，确保仅能传入已定义的表情名称
export type ExpressionName = keyof typeof expressions;


