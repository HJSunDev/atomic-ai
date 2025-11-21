import { Id } from "@/convex/_generated/dataModel";

export const EditorChatPanel = ({ appId }: { appId: Id<"apps"> }) => (
  <div className="h-full bg-background flex flex-col">
    <div className="h-10 flex items-center px-4 border-b font-medium text-sm text-muted-foreground">
        AI 助手
    </div>
    <div className="flex-1 p-4 text-muted-foreground text-sm overflow-auto">
      <div className="bg-muted/50 rounded-lg p-4 mb-4 border border-dashed">
        <p className="mb-2 font-medium text-foreground">👋 欢迎使用应用生成器</p>
        <p>您可以在这里描述想要修改的需求，AI 将会自动更新右侧的代码。</p>
      </div>
      <p className="text-xs opacity-50">App ID: {appId}</p>
    </div>
    <div className="p-3 border-t">
        <div className="relative">
            <input 
                className="w-full bg-muted/50 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="输入修改指令..."
            />
        </div>
    </div>
  </div>
);

