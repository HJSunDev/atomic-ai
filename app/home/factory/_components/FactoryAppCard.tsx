import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GitCommitHorizontal, MoreHorizontal, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface FactoryAppCardProps {
  app: {
    _id: Id<"apps">;
    name: string;
    isPublished?: boolean;
    v: number;
    creationTime: number;
  };
  onRename: (appId: Id<"apps">, newName: string) => Promise<void>;
  onDelete: (appId: Id<"apps">) => Promise<void>;
}

export function FactoryAppCard({ app, onRename, onDelete }: FactoryAppCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(app.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 进入编辑模式自动聚焦
  useEffect(() => {
    if (isEditing && inputRef.current) {
      // 稍微延迟以确保 input 渲染完成
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50); // 增加一点延迟，确保 Dropdown 的焦点恢复逻辑已经执行完毕
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handleRenameSubmit = async () => {
    // 只有在编辑模式下才处理提交
    if (!isEditing) return;

    const trimmed = tempName.trim();
    
    if (!trimmed) {
      toast.error("名称不能为空", { position: "top-center" });
      setTempName(app.name);
      setIsEditing(false);
      return;
    }

    if (trimmed === app.name) {
      setIsEditing(false);
      return;
    }

    setIsRenaming(true);
    try {
      await onRename(app._id, trimmed);
      toast.success("重命名成功", { position: "top-center" });
      setIsEditing(false);
    } catch (error) {
      toast.error("重命名失败", { position: "top-center" });
      setTempName(app.name);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    // 点击删除后关闭菜单，避免菜单残留
    setIsMenuOpen(false); 
    
    try {
      await onDelete(app._id);
      toast.success("删除成功", { position: "top-center" });
    } catch (error) {
      toast.error("删除失败", { position: "top-center" });
      setIsDeleting(false); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // 此时 input 还是聚焦状态，onBlur 还没触发
      // 我们直接失焦，让 onBlur 处理提交逻辑，避免重复调用
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTempName(app.name);
      setIsEditing(false);
    }
  };

  return (
    <section className="group flex flex-col gap-3 p-2 -m-2 rounded-2xl hover:bg-muted/40 dark:hover:bg-muted/10 transition-all duration-200">
      {/* Preview Card：仅上半部分可跳转 */}
      <Link
        href={`/home/factory/${app._id}`}
        onClick={(e) => {
          if (isEditing) e.preventDefault();
        }}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
      >
        <div className="relative aspect-[16/10] rounded-xl bg-gradient-to-br from-muted/50 to-muted/10 border border-border/40 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 cursor-pointer">
          {/* Center Icon/Preview - 纯视觉装饰 */}
          <div className="absolute inset-0 p-4 flex flex-col select-none pointer-events-none overflow-hidden">
            <div className="w-full h-full bg-background shadow-sm rounded-lg border border-border/60 flex flex-col opacity-60 group-hover:opacity-90 group-hover:translate-y-[-4px] group-hover:scale-[1.02] group-hover:shadow-md transition-all duration-500 ease-out">
              <div className="h-4 md:h-5 border-b border-border/40 bg-muted/30 flex items-center px-2 md:px-3 gap-1.5 shrink-0">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-400/20" />
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-400/20" />
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400/20" />
              </div>
              <div className="flex-1 flex bg-background/40 relative overflow-hidden">
                <div className="w-[28%] border-r border-border/40 bg-muted/5 p-2 flex flex-col gap-1.5">
                  <div className="h-1.5 w-8 rounded-full bg-muted-foreground/10" />
                  <div className="space-y-1 mt-1">
                    <div className="h-1 w-full rounded-full bg-muted-foreground/5" />
                    <div className="h-1 w-3/4 rounded-full bg-muted-foreground/5" />
                    <div className="h-1 w-5/6 rounded-full bg-muted-foreground/5" />
                  </div>
                </div>
                <div className="flex-1 p-2 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-primary/5 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <div className="h-1.5 w-12 rounded-full bg-muted-foreground/10" />
                    </div>
                  </div>
                  <div className="h-12 w-full rounded border border-border/20 bg-muted/5" />
                  <div className="space-y-1">
                    <div className="h-1 w-full rounded-full bg-muted-foreground/5" />
                    <div className="h-1 w-2/3 rounded-full bg-muted-foreground/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Right Actions */}
          <aside 
            className={`absolute top-2 right-2 transition-opacity duration-200 z-10 ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu 
              open={isMenuOpen} 
              onOpenChange={(open) => {
                // 只有在非编辑模式且非删除模式下才允许切换
                if (!isEditing && !isDeleting) {
                  setIsMenuOpen(open);
                } else if (!open) {
                   // 如果试图关闭，但我们正在操作（比如点击重命名触发的关闭），允许关闭
                   setIsMenuOpen(false);
                }
              }}
            >
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md bg-background/80 backdrop-blur shadow-sm hover:bg-background border border-border/20 cursor-pointer">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              
              {/* 关键修复：阻止关闭时的焦点恢复，防止 Input 刚聚焦就被抢走 */}
              <DropdownMenuContent 
                align="end" 
                className="w-40"
                onCloseAutoFocus={(e) => {
                  if (isEditing) {
                    e.preventDefault();
                  }
                }}
              >
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault(); // 阻止默认行为
                    e.stopPropagation();
                    
                    // 先关闭菜单
                    setIsMenuOpen(false);
                    
                    // 立即进入编辑模式
                    setIsEditing(true);
                  }}
                  disabled={isRenaming || isDeleting}
                >
                  重命名
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteClick();
                  }}
                  disabled={isRenaming || isDeleting}
                  className="text-red-600 focus:text-red-600"
                >
                  {isDeleting ? "删除中..." : "删除"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </aside>
        </div>
      </Link>

      {/* Meta Info & Editable Title */}
      <div className="px-1 space-y-1.5">
          <div className="flex items-start justify-between gap-4 h-7 relative">
            {isEditing ? (
              <div className="flex-1 relative z-20" onClick={(e) => e.preventDefault()}>
                {/* Notion Style Input: 无边框，背景微灰，选区清晰 */}
                <Input
                  ref={inputRef}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleKeyDown}
                  disabled={isRenaming}
                  // 阻止冒泡，防止点击输入框触发 Link
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 px-0.5 py-0 text-base font-medium rounded-sm border-none bg-muted/50 focus-visible:ring-0 focus-visible:bg-muted/80 transition-colors -ml-0.5 w-full selection:bg-primary/20"
                />
                {isRenaming && (
                  <div className="absolute right-0 top-1.5 w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                )}
              </div>
            ) : (
              <h3 className="font-medium text-base text-foreground/90 group-hover:text-primary transition-colors line-clamp-1 py-0.5">
                {app.name}
              </h3>
            )}
            
            {!isEditing && app.isPublished && (
              <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 h-4.5 font-normal bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-transparent mt-1">
                Public
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60 font-medium">
            <div className="flex items-center gap-1">
              <GitCommitHorizontal className="w-3 h-3" />
              <span>v{app.v}</span>
            </div>
            <div className="w-0.5 h-0.5 rounded-full bg-current" />
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(app.creationTime).toLocaleDateString()}</span>
            </div>
          </div>
      </div>
    </section>
  );
}
