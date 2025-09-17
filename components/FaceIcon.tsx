"use client";

// 使用动画库为 SVG 元素提供平滑过渡，便于表情切换时的自然联动
import { motion } from "framer-motion";
import { expressions, type ExpressionName, faceParts } from "@/lib/expressions";

interface FaceIconProps {
  // 指定当前要渲染的表情名；缺省为基线表情
  expression?: ExpressionName;
  className?: string;
}

const strokeW = 1.1;

// 统一的过渡参数：使用弹簧以获得更具生命力的微动反馈
const transition = { type: "spring", stiffness: 200, damping: 20 } as const;

export function FaceIcon({ expression = "neutral", className }: FaceIconProps) {
  // 从数据层取出该表情的目标属性，视图保持无状态，纯粹受控于配置
  const current = expressions[expression];

  return (
    <svg width="48" height="48" viewBox="0 0 24 24" className={className ?? "text-gray-700"}>
      {/* 左侧眉毛 */}
      <motion.path
        animate={current[faceParts.leftBrow]}
        transition={transition}
        stroke="currentColor"
        strokeWidth={strokeW}
        strokeLinecap="round"
        fill="none"
      />
      {/* 右侧眉毛 */}
      <motion.path
        animate={current[faceParts.rightBrow]}
        transition={transition}
        stroke="currentColor"
        strokeWidth={strokeW}
        strokeLinecap="round"
        fill="none"
      />

      {/* 左眼：椭圆形状，支持独立控制水平和垂直半径以实现眨眼效果 */}
      <motion.ellipse
        animate={current[faceParts.leftEye]}
        transition={transition}
        fill="currentColor"
      />
      {/* 右眼：椭圆形状，支持独立控制水平和垂直半径以实现眨眼效果 */}
      <motion.ellipse
        animate={current[faceParts.rightEye]}
        transition={transition}
        fill="currentColor"
      />

      {/* 鼻梁：连接眉心和鼻尖的线条，构成鼻子的上部轮廓，影响面部中线的立体感 */}
      <motion.path
        animate={current[faceParts.noseBridge]}
        transition={transition}
        stroke="currentColor"
        strokeWidth={strokeW}
        strokeLinecap="round"
        fill="none"
      />
      {/* 鼻子：位于鼻梁下方的横向线条，构成鼻子的下部轮廓，与鼻梁共同完成鼻子的整体形状 */}
      <motion.path
        animate={current[faceParts.noseTip]}
        transition={transition}
        stroke="currentColor"
        strokeWidth={strokeW}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default FaceIcon;


