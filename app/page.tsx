"use client"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { SignInButton, UserButton } from "@clerk/nextjs"

export default function Home() {
  const { isSignedIn } = useUser()

  return (
    <div className="flex flex-col min-h-screen">
      <style jsx global>{`
        @keyframes pulse-slow {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-orbit-slow {
          animation: orbit 12s infinite linear;
        }
      `}</style>
      {/* 导航栏 */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full fixed top-0 z-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="md" />
            <span className="font-bold text-xl">Atomic</span>
          </div>
          <div className="flex items-center gap-4 landing-navbar">
            {isSignedIn ? (
              <>
                <UserButton/>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 英雄区域 - 占满首屏 */}
        <section className="h-screen flex items-center relative">
          {/* 移除背景效果 */}
          
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 w-full items-center">
              {/* 左侧内容 */}
              <div className="flex flex-col justify-center text-left ml-0 md:ml-[2rem]">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-6 w-fit bg-white">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">AI驱动的开发效率革命</span>
                </div>
                <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.5rem] font-semibold tracking-tight mb-4 sm:mb-6">
                  模块化AI协作<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">开发效率平台</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl">
                  通过模块化、可组合的提示词管理与AI智能体协作，覆盖开发全生命周期场景，提升开发效率与代码质量
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {isSignedIn ? (
                    <Link href="/home">
                      <Button className="px-[1.5rem] py-[0.5rem] sm:px-[2rem] sm:py-[1.5rem] text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        开始使用
                      </Button>
                    </Link>
                  ) : (
                    <SignInButton mode="modal">
                      <Button className="px-[1.5rem] py-[0.5rem] sm:px-[2rem] sm:py-[1.5rem] text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        开始使用
                      </Button>
                    </SignInButton>
                  )}
                  <Button variant="outline" className="px-[1.5rem] py-[0.5rem] sm:px-[2rem] sm:py-[1.5rem] text-sm sm:text-base">
                    查看演示
                  </Button>
                </div>
              </div>
              
              {/* 右侧占位区域 - 为将来的动画效果预留空间 */}
              <div className="hidden md:flex justify-center items-center ml-0 md:ml-[2rem]">
                <div className="relative w-full max-w-md aspect-square">
                  {/* 外层光晕效果 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-xl"></div>
                  
                  {/* 内层圆形 */}
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    {/* 简单的图标网格，作为占位 */}
                    <div className="grid grid-cols-2 gap-4 p-6 lg:gap-6 lg:p-10">
                      <div className="bg-blue-50 rounded-lg p-3 lg:p-5 flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.75rem" height="1.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 lg:w-[2.25rem] lg:h-[2.25rem]">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="2" />
                          <path d="M12 19a7 7 0 1 0 0-14" />
                        </svg>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 lg:p-5 flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.75rem" height="1.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 lg:w-[2.25rem] lg:h-[2.25rem]">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 lg:p-5 flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.75rem" height="1.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 lg:w-[2.25rem] lg:h-[2.25rem]">
                          <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 lg:p-5 flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.75rem" height="1.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 lg:w-[2.25rem] lg:h-[2.25rem]">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 移除向下滚动指示器 */}
        </section>

        {/* 特性区域 */}
        <section id="features" className="py-8 sm:py-12">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4 sm:mb-8 ">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">三层模块化架构</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
                支持灵活组合与扩展
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 ">
              {/* 原子层 */}
              <div className="bg-background rounded-xl border p-6 lg:p-8 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 lg:w-[3.5rem] lg:h-[3.5rem] rounded-lg bg-blue-100 flex items-center justify-center mb-4 lg:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 lg:w-[1.75rem] lg:h-[1.75rem]">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M12 19a7 7 0 1 0 0-14" />
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3">原子层</h3>
                <h4 className="text-xs lg:text-sm text-muted-foreground mb-2 lg:mb-3">Prompt Modules</h4>
                <p className="text-muted-foreground text-sm lg:text-base">
                  基础提示词模块，可重用、可组合的AI提示词库，覆盖各类开发场景
                </p>
              </div>

              {/* 组合层 */}
              <div className="bg-background rounded-xl border p-6 lg:p-8 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 lg:w-[3.5rem] lg:h-[3.5rem] rounded-lg bg-purple-100 flex items-center justify-center mb-4 lg:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 lg:w-[1.75rem] lg:h-[1.75rem]">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3">组合层</h3>
                <h4 className="text-xs lg:text-sm text-muted-foreground mb-2 lg:mb-3">Flow Canvas</h4>
                <p className="text-muted-foreground text-sm lg:text-base">
                  可视化拖拽式流程编排，将原子提示词模块组合成复杂工作流
                </p>
              </div>

              {/* 智能层 */}
              <div className="bg-background rounded-xl border p-6 lg:p-8 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 lg:w-[3.5rem] lg:h-[3.5rem] rounded-lg bg-green-100 flex items-center justify-center mb-4 lg:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 lg:w-[1.75rem] lg:h-[1.75rem]">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3">智能层</h3>
                <h4 className="text-xs lg:text-sm text-muted-foreground mb-2 lg:mb-3">AI Agent Hub</h4>
                <p className="text-muted-foreground text-sm lg:text-base">
                  AI交互与自动化，智能体协作完成复杂开发任务，提升团队效率
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 工作流程区域 */}
        <section id="workflow" className="py-16 sm:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">覆盖开发全生命周期</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
                从需求分析到代码实现，从测试到部署，Atomic全程助力
              </p>
            </div>

            {/* 工作流程设计 */}
            <div className="relative mt-12 sm:mt-20">
              {/* 水平连接线 */}
              <div className="hidden md:block absolute top-16 left-0 w-full h-[0.0625rem] bg-border"></div>
              
              <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
                {/* 步骤1 */}
                <div className="flex flex-col items-center">
                  <div className="w-[3rem] h-[3rem] sm:w-[4rem] sm:h-[4rem] rounded-full border-2 border-primary bg-background flex items-center justify-center mb-6 sm:mb-8 z-10">
                    <span className="font-bold text-primary text-lg sm:text-xl">1</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-center">需求分析</h3>
                  <p className="text-muted-foreground text-center text-sm sm:text-base">
                    AI辅助分析需求文档，提取关键点，生成任务清单
                  </p>
                </div>

                {/* 步骤2 */}
                <div className="flex flex-col items-center">
                  <div className="w-[3rem] h-[3rem] sm:w-[4rem] sm:h-[4rem] rounded-full border-2 border-primary bg-background flex items-center justify-center mb-6 sm:mb-8 z-10">
                    <span className="font-bold text-primary text-lg sm:text-xl">2</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-center">代码生成</h3>
                  <p className="text-muted-foreground text-center text-sm sm:text-base">
                    基于需求智能生成高质量代码，支持多种框架和语言
                  </p>
                </div>

                {/* 步骤3 */}
                <div className="flex flex-col items-center">
                  <div className="w-[3rem] h-[3rem] sm:w-[4rem] sm:h-[4rem] rounded-full border-2 border-primary bg-background flex items-center justify-center mb-6 sm:mb-8 z-10">
                    <span className="font-bold text-primary text-lg sm:text-xl">3</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-center">测试与优化</h3>
                  <p className="text-muted-foreground text-center text-sm sm:text-base">
                    自动生成测试用例，发现并修复潜在问题，优化性能
                  </p>
                </div>

                {/* 步骤4 */}
                <div className="flex flex-col items-center">
                  <div className="w-[3rem] h-[3rem] sm:w-[4rem] sm:h-[4rem] rounded-full border-2 border-primary bg-background flex items-center justify-center mb-6 sm:mb-8 z-10">
                    <span className="font-bold text-primary text-lg sm:text-xl">4</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-center">部署与监控</h3>
                  <p className="text-muted-foreground text-center text-sm sm:text-base">
                    协助配置部署流程，提供运行时监控和问题诊断
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA区域 */}
        <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">准备好提升您的开发效率了吗？</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8 sm:mb-10 text-sm sm:text-lg">
              加入数千名开发者的行列，体验AI驱动的开发效率革命
            </p>
            <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 px-[1.5rem] py-[0.5rem] sm:px-[2rem] sm:py-[1.5rem] text-sm sm:text-base">
              <Link href="/home">立即开始免费试用</Link>
            </Button>
          </div>
        </section>

        {/* 常见问题 */}
        <section id="faq" className="py-16 sm:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">常见问题</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
                关于Atomic的一些常见问题解答
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
              <div className="border rounded-lg p-5 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-base sm:text-lg font-bold mb-2">Atomic适合哪些开发者？</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Atomic适合所有前端开发者和技术团队，无论是个人开发者还是大型企业团队都能从中受益。
                </p>
              </div>

              <div className="border rounded-lg p-5 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-base sm:text-lg font-bold mb-2">如何开始使用Atomic？</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  注册账号后，您可以立即开始使用基础功能。我们提供详细的文档和教程帮助您快速上手。
                </p>
              </div>

              <div className="border rounded-lg p-5 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-base sm:text-lg font-bold mb-2">Atomic支持哪些编程语言和框架？</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  我们支持主流的前端框架和语言，包括React、Vue、Angular、TypeScript等，并持续扩展中。
                </p>
              </div>

              <div className="border rounded-lg p-5 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-base sm:text-lg font-bold mb-2">Atomic如何保护我的代码和数据安全？</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  我们采用企业级加密技术保护您的代码和数据，并提供细粒度的权限控制，确保安全性。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t py-8 sm:py-12 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <Logo size="md" />
              <span className="font-bold text-xl">Atomic</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">关于我们</Link>
              <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">博客</Link>
              <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">文档</Link>
              <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">联系我们</Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Atomic. 保留所有权利。
          </div>
        </div>
      </footer>
    </div>
  );
}
