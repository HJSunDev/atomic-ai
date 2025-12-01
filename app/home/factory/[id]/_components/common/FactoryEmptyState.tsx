import { 
  Layout, 
  Globe, 
  Lock, 
  ListTodo, 
  BarChart3, 
  UserCircle, 
  Sparkles,
  ArrowRight,
  Terminal
} from "lucide-react";

interface FactoryEmptyStateProps {
  appType: "html" | "react";
  onSelect?: (text: string) => void;
}

/**
 * FactoryEmptyState - Factory 工坊空状态组件
 * 
 * 设计风格：Notion-like
 * - 极简主义，强调排版和间距
 * - 使用中性色调，避免过度的渐变
 * - 卡片/列表式的交互项
 */
export function FactoryEmptyState({ appType, onSelect }: FactoryEmptyStateProps) {
  const examples =
    appType === "html"
      ? [
          { 
            text: "创建一个响应式的个人简历页面", 
            icon: Layout, 
            label: "个人简历",
            desc: "包含经历、技能的现代简历布局" 
          },
          { 
            text: "制作一个产品展示落地页", 
            icon: Globe, 
            label: "产品落地页",
            desc: "Hero 区域、特性介绍与 CTA" 
          },
          { 
            text: "设计一个精美的登录表单", 
            icon: Lock, 
            label: "登录表单",
            desc: "包含验证、记住密码等功能" 
          },
        ]
      : [
          { 
            text: "创建一个待办事项应用", 
            icon: ListTodo, 
            label: "待办事项",
            desc: "支持增删改查与状态过滤" 
          },
          { 
            text: "制作一个数据统计面板", 
            icon: BarChart3, 
            label: "数据看板",
            desc: "图表展示与关键指标卡片" 
          },
          { 
            text: "设计一个用户管理界面", 
            icon: UserCircle, 
            label: "用户管理",
            desc: "表格列表、搜索与分页功能" 
          },
        ];

  return (
    <div className="min-h-full flex flex-col p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="m-auto max-w-2xl w-full space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#202020] mb-1 shadow-sm ring-1 ring-gray-200/50 dark:ring-white/5">
            {appType === "html" ? (
              <span className="text-2xl">🎨</span>
            ) : (
              <span className="text-2xl">⚡️</span>
            )}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              想构建什么？
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              描述你的想法，AI为你实现。
            </p>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider px-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500/80" />
            <span>推荐模版</span>
          </div>
          
          <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
            {examples.map((example, index) => (
              <div
                key={index}
                onClick={() => onSelect?.(example.text)}
                className="group relative flex flex-col gap-2 p-3.5 rounded-xl bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm dark:hover:shadow-none transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Icon & Header */}
                <div className="flex items-center justify-between mb-0.5">
                  <div className="p-1.5 rounded-md bg-gray-50 dark:bg-[#252525] text-gray-600 dark:text-gray-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    <example.icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-200 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {example.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {example.desc}
                  </p>
                </div>
                
                {/* Hover Indicator - Subtle right arrow appearing */}
                <div className="absolute bottom-3 right-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
