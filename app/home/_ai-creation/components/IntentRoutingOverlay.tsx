"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  MessageSquare, 
  FileText, 
  AppWindow, 
  CheckCircle2, 
  AlertCircle, 
  BrainCircuit
} from "lucide-react";
import type { RoutingStatus } from "@/services/intent/useIntentRouter";
import type { IntentResult, IntentType } from "@/services/intent/types";
import { cn } from "@/lib/utils";

interface IntentRoutingOverlayProps {
  status: RoutingStatus;
  intentResult: IntentResult | null;
  onClose?: () => void;
}

/**
 * 意图识别路由遮罩/状态指示器
 * 
 * 展示：
 * 1. 思考中/识别中 (Detecting)
 * 2. 路由中/准备跳转 (Routing)
 * 3. 成功/失败反馈
 */
export const IntentRoutingOverlay = ({ 
  status, 
  intentResult,
  onClose 
}: IntentRoutingOverlayProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== "idle") {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // 自动关闭成功或错误状态
  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setTimeout(() => {
        onClose?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (!visible && status === "idle") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-[18px]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="bg-card border border-border shadow-2xl rounded-xl p-6 min-w-[320px] max-w-[90%] flex flex-col items-center text-center gap-4"
          >
            {/* 状态图标区域 */}
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
              <AnimatePresence mode="wait">
                {status === "detecting" && (
                  <motion.div
                    key="detecting"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
                    <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                  </motion.div>
                )}

                {(status === "routing" || status === "success") && intentResult && (
                  <motion.div
                    key="routing"
                    initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    className="flex items-center justify-center"
                  >
                    <IntentIcon intent={intentResult.intent} className="w-8 h-8 text-primary" />
                    {status === "success" && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100" />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    key="error"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 文字说明区域 */}
            <div className="flex flex-col gap-1">
              <AnimatePresence mode="wait">
                {status === "detecting" && (
                  <motion.div
                    key="text-detecting"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <h3 className="font-medium text-foreground">AI 正在分析您的需求</h3>
                    <p className="text-sm text-muted-foreground">正在识别最佳创作模式...</p>
                  </motion.div>
                )}

                {(status === "routing" || status === "success") && intentResult && (
                  <motion.div
                    key="text-routing"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="font-medium text-foreground">
                      {status === "success" ? "准备就绪" : `即将进入 ${getIntentName(intentResult.intent)}`}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-[260px]">
                      {intentResult.reason || intentResult.summary}
                    </p>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    key="text-error"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="font-medium text-foreground">识别遇到问题</h3>
                    <p className="text-sm text-muted-foreground">已自动降级为普通对话模式</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 辅助组件：意图图标
const IntentIcon = ({ intent, className }: { intent: IntentType; className?: string }) => {
  switch (intent) {
    case "chat":
      return <MessageSquare className={className} />;
    case "document":
      return <FileText className={className} />;
    case "app":
      return <AppWindow className={className} />;
    default:
      return <MessageSquare className={className} />;
  }
};

// 辅助函数：意图名称
const getIntentName = (intent: IntentType): string => {
  const map: Record<IntentType, string> = {
    chat: "对话模式",
    document: "文档创作",
    app: "应用生成",
  };
  return map[intent] || "对话模式";
};

