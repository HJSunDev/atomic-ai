import { Sparkles, Code, Wand2 } from "lucide-react";

interface FactoryEmptyStateProps {
  appType: "html" | "react";
}

/**
 * FactoryEmptyState - Factory 工坊空状态组件
 * 
 * 设计要点：
 * - 在无消息时显示，引导用户开始对话
 * - 根据应用类型（HTML/React）显示不同的提示信息
 * - 提供快捷示例，帮助用户快速开始
 */
export function FactoryEmptyState({ appType }: FactoryEmptyStateProps) {
  const examples =
    appType === "html"
      ? [
          "创建一个响应式的个人简历页面",
          "制作一个产品展示落地页",
          "设计一个精美的登录表单",
        ]
      : [
          "创建一个待办事项应用",
          "制作一个数据统计面板",
          "设计一个用户管理界面",
        ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Wand2 className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            开始创建你的 {appType === "html" ? "HTML" : "React"} 应用
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            描述你想要的功能，AI 将为你生成完整的代码
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Sparkles className="w-4 h-4" />
            <span>试试这些示例：</span>
          </div>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <div
                key={index}
                className="text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <Code className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                  <span>{example}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 text-xs text-gray-500 dark:text-gray-400">
          在下方输入框中描述你的需求，按 Enter 发送
        </div>
      </div>
    </div>
  );
}


