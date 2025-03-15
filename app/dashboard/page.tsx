import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Clock, 
  Star, 
  Layers, 
  Puzzle, 
  Bot, 
  ArrowRight 
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // 最近使用的项目数据（模拟数据）
  const recentItems = [
    { id: 1, type: "module", name: "代码审查提示词", updatedAt: "2小时前" },
    { id: 2, type: "flow", name: "需求分析流程", updatedAt: "昨天" },
    { id: 3, type: "agent", name: "代码生成助手", updatedAt: "3天前" },
  ];

  // 收藏的项目数据（模拟数据）
  const starredItems = [
    { id: 4, type: "module", name: "API文档生成", updatedAt: "上周" },
    { id: 5, type: "flow", name: "前端组件开发流程", updatedAt: "2周前" },
  ];

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">欢迎回来，开发者</h1>
          <p className="text-muted-foreground mt-1">管理您的AI协作开发工作流</p>
        </div>
        <Button className="w-full md:w-auto flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>创建新项目</span>
        </Button>
      </div>

      {/* 快速访问卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 提示词模块卡片 */}
        <Link 
          href="/dashboard/modules"
          className="group bg-background rounded-xl border p-6 hover:shadow-md transition-shadow flex flex-col"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
            <Puzzle className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">提示词模块</h3>
          <p className="text-muted-foreground text-sm flex-1 mb-4">
            创建和管理可重用的提示词模块，覆盖各类开发场景
          </p>
          <div className="flex items-center text-sm text-primary font-medium">
            <span>查看全部模块</span>
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* 组合流程卡片 */}
        <Link 
          href="/dashboard/flows"
          className="group bg-background rounded-xl border p-6 hover:shadow-md transition-shadow flex flex-col"
        >
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
            <Layers className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">组合流程</h3>
          <p className="text-muted-foreground text-sm flex-1 mb-4">
            通过可视化拖拽式流程编排，将原子提示词模块组合成复杂工作流
          </p>
          <div className="flex items-center text-sm text-primary font-medium">
            <span>查看全部流程</span>
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* AI智能体卡片 */}
        <Link 
          href="/dashboard/agents"
          className="group bg-background rounded-xl border p-6 hover:shadow-md transition-shadow flex flex-col"
        >
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
            <Bot className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">AI智能体</h3>
          <p className="text-muted-foreground text-sm flex-1 mb-4">
            配置AI智能体，自动化完成复杂开发任务，提升团队效率
          </p>
          <div className="flex items-center text-sm text-primary font-medium">
            <span>查看全部智能体</span>
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 最近使用和收藏区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近使用 */}
        <div className="bg-background rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-bold">最近使用</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">查看全部</Button>
          </div>
          
          <div className="space-y-2">
            {recentItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.type === "module" && <Puzzle className="h-4 w-4 text-blue-600" />}
                  {item.type === "flow" && <Layers className="h-4 w-4 text-purple-600" />}
                  {item.type === "agent" && <Bot className="h-4 w-4 text-green-600" />}
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{item.updatedAt}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 收藏 */}
        <div className="bg-background rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="font-bold">收藏</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">查看全部</Button>
          </div>
          
          <div className="space-y-2">
            {starredItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.type === "module" && <Puzzle className="h-4 w-4 text-blue-600" />}
                  {item.type === "flow" && <Layers className="h-4 w-4 text-purple-600" />}
                  {item.type === "agent" && <Bot className="h-4 w-4 text-green-600" />}
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{item.updatedAt}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </Button>
                </div>
              </div>
            ))}

            {/* 如果没有收藏项目，显示空状态 */}
            {starredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Star className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h4 className="font-medium mb-1">没有收藏项目</h4>
                <p className="text-sm text-muted-foreground">
                  收藏您常用的提示词模块、流程或智能体以便快速访问
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 