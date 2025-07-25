"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { SignInButton, UserButton } from "@clerk/nextjs"

// 定义步骤类型
type Step = 1 | 2 | 3

// 定义卡片数据类型
interface PromptCard {
  id: string
  title: string
  description: string
  color: string
}

// 模拟数据
const STEP_DATA = {
  1: {
    title: "选择场景",
    description: "你想要AI帮你做什么？",
    cards: [
      { id: "code", title: "代码优化", description: "重构、注释、测试", color: "bg-blue-100 border-blue-200" },
      { id: "write", title: "文档写作", description: "技术文档、说明书", color: "bg-green-100 border-green-200" },
      { id: "analysis", title: "内容分析", description: "总结、提取要点", color: "bg-purple-100 border-purple-200" },
      { id: "design", title: "方案设计", description: "架构、流程设计", color: "bg-orange-100 border-orange-200" },
    ]
  },
  2: {
    title: "选择风格",
    description: "你希望AI的回答风格是？",
    cards: [
      { id: "professional", title: "专业严谨", description: "技术准确、逻辑清晰", color: "bg-gray-100 border-gray-200" },
      { id: "detailed", title: "详细全面", description: "步骤清楚、覆盖全面", color: "bg-blue-100 border-blue-200" },
      { id: "concise", title: "简洁高效", description: "重点突出、简明扼要", color: "bg-green-100 border-green-200" },
      { id: "creative", title: "创新思维", description: "多角度、创造性思考", color: "bg-purple-100 border-purple-200" },
    ]
  },
  3: {
    title: "添加要求",
    description: "你还有什么特殊要求？",
    cards: [
      { id: "examples", title: "提供示例", description: "包含具体的代码示例", color: "bg-yellow-100 border-yellow-200" },
      { id: "steps", title: "分步说明", description: "按步骤详细说明", color: "bg-blue-100 border-blue-200" },
      { id: "best-practices", title: "最佳实践", description: "遵循行业最佳实践", color: "bg-green-100 border-green-200" },
      { id: "explain", title: "解释原理", description: "说明背后的原理", color: "bg-purple-100 border-purple-200" },
    ]
  }
}

// 可拖拽卡片组件
function DraggableCard({ card, isSelected, onClick }: { 
  card: PromptCard
  isSelected: boolean
  onClick: () => void 
}) {
  return (
    <div
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
        isSelected 
          ? card.color + ' ring-2 ring-blue-400 shadow-lg' 
          : card.color + ' hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <h3 className="font-medium text-gray-900 mb-1">{card.title}</h3>
      <p className="text-sm text-gray-600">{card.description}</p>
    </div>
  )
}

// 主体验组件
function AtomicPromptComposer() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [selectedCards, setSelectedCards] = useState<Record<Step, PromptCard | null>>({
    1: null,
    2: null,
    3: null
  })

  // 处理卡片选择
  const handleCardSelect = (card: PromptCard) => {
    setSelectedCards(prev => ({
      ...prev,
      [currentStep]: prev[currentStep]?.id === card.id ? null : card
    }))
  }

  // 下一步
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  // 上一步
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  // 生成提示词
  const handleGenerate = () => {
    // 这里后续实现生成逻辑
    console.log("生成提示词", selectedCards)
  }

  const currentStepData = STEP_DATA[currentStep]
  const canProceed = selectedCards[currentStep] !== null
  const allStepsCompleted = selectedCards[1] && selectedCards[2] && selectedCards[3]

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center space-x-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 ml-4 transition-colors ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* 当前步骤标题 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
        <p className="text-gray-600">{currentStepData.description}</p>
      </div>

      {/* 卡片选择区域 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentStepData.cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            isSelected={selectedCards[currentStep]?.id === card.id}
            onClick={() => handleCardSelect(card)}
          />
        ))}
      </div>

      {/* 已选择的组合展示 */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">你的提示词组合</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="space-y-2">
              <div className="text-sm font-medium text-gray-500">
                {STEP_DATA[step as Step].title}
              </div>
              {selectedCards[step as Step] ? (
                <div className={`p-3 rounded-lg border ${selectedCards[step as Step]!.color}`}>
                  <div className="font-medium text-sm">{selectedCards[step as Step]!.title}</div>
                  <div className="text-xs text-gray-600">{selectedCards[step as Step]!.description}</div>
                </div>
              ) : (
                <div className="p-3 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400 text-sm">
                  未选择
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="px-6"
        >
          上一步
        </Button>

        <div className="flex gap-3">
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              下一步
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!allStepsCompleted}
              className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              生成提示词
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MarketingV2() {
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 优雅的背景层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/40 to-purple-50/40"></div>
      
      {/* 背景几何形状 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-blue-200/20 rounded-full blur-xl"></div>
      </div>

      {/* 极简导航栏 */}
      <header className="relative z-50 border-b border-white/20 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="md" />
            <span className="font-bold text-xl">Atomic</span>
          </div>
          <div>
            {isSignedIn ? (
              <UserButton/>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  登录
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* 主要内容 - 全屏体验 */}
      <main className="relative z-10 pt-20 pb-20">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-light tracking-tight mb-4">
            <span className="text-gray-900">模块化</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium ml-3">
              提示词
            </span>
          </h1>
          <p className="text-lg text-gray-600 font-light">
            通过三个步骤，组合出专属的AI提示词
          </p>
        </div>

        {/* 体验区域 */}
        <div className="container mx-auto px-6">
          <AtomicPromptComposer />
        </div>

        {/* 底部CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-500 mb-4">体验完整功能，需要登录账户</p>
          {isSignedIn ? (
            <Link href="/home">
              <Button className="px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-xl">
                进入完整工作台
              </Button>
            </Link>
          ) : (
            <SignInButton mode="modal">
              <Button className="px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-xl">
                登录体验完整功能
              </Button>
            </SignInButton>
          )}
        </div>
      </main>
    </div>
  )
} 