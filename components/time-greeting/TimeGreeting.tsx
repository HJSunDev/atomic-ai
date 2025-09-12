'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Sunrise, Sunset, Moon, Coffee, Star } from 'lucide-react';

// 时间段枚举
export enum TimeOfDay {
  EARLY_MORNING = 'early_morning',
  MORNING = 'morning',
  LATE_MORNING = 'late_morning',
  NOON = 'noon',
  AFTERNOON = 'afternoon',
  EARLY_EVENING = 'early_evening',
  EVENING = 'evening',
  NIGHT = 'night',
  LATE_NIGHT = 'late_night'
}

// 问候数据接口
export interface GreetingData {
  timeOfDay: TimeOfDay;
  hour: number;
  minute: number;
  timestamp: Date;
  greeting: string;
  message: string;
  period: string;
}

// 默认问候配置
export const defaultGreetingConfig: Record<TimeOfDay, { greeting: string; message: string; period: string }> = {
  [TimeOfDay.EARLY_MORNING]: {
    greeting: '早晨好',
    message: '清晨的第一缕阳光，为你带来新的希望 🌅',
    period: '清晨'
  },
  [TimeOfDay.MORNING]: {
    greeting: '上午好',
    message: '美好的一天从现在开始，愿你精神饱满 ☕',
    period: '早晨'
  },
  [TimeOfDay.LATE_MORNING]: {
    greeting: '上午好',
    message: '上午时光正好，保持专注，你很棒 💪',
    period: '上午'
  },
  [TimeOfDay.NOON]: {
    greeting: '中午好',
    message: '午餐时间到了，记得好好休息一下 🍽️',
    period: '午间'
  },
  [TimeOfDay.AFTERNOON]: {
    greeting: '下午好',
    message: '下午的阳光很温暖，就像你的笑容一样 😊',
    period: '下午'
  },
  [TimeOfDay.EARLY_EVENING]: {
    greeting: '傍晚好',
    message: '夕阳西下，今天辛苦了，该放松一下了 🌇',
    period: '傍晚'
  },
  [TimeOfDay.EVENING]: {
    greeting: '晚上好',
    message: '夜晚来临，愿你拥有温馨的晚餐时光 🌙',
    period: '晚上'
  },
  [TimeOfDay.NIGHT]: {
    greeting: '晚安',
    message: '夜深了，早点休息，明天又是美好的一天 ✨',
    period: '夜晚'
  },
  [TimeOfDay.LATE_NIGHT]: {
    greeting: '深夜好',
    message: '夜猫子，注意身体哦，适当休息很重要 🦉',
    period: '深夜'
  }
};

// 核心 Hook
export const useTimeGreeting = (
  customConfig?: Partial<Record<TimeOfDay, { greeting: string; message: string; period: string }>>,
  updateInterval: number = 60000
) => {
  const [greetingData, setGreetingData] = useState<GreetingData | null>(null);

  // 根据小时和分钟确定时间段
  const getTimeOfDay = (hour: number, minute: number): TimeOfDay => {
    const timeValue = hour + minute / 60;

    if (timeValue >= 5 && timeValue < 6) return TimeOfDay.EARLY_MORNING;
    if (timeValue >= 6 && timeValue < 9) return TimeOfDay.MORNING;
    if (timeValue >= 9 && timeValue < 12) return TimeOfDay.LATE_MORNING;
    if (timeValue >= 12 && timeValue < 14) return TimeOfDay.NOON;
    if (timeValue >= 14 && timeValue < 17) return TimeOfDay.AFTERNOON;
    if (timeValue >= 17 && timeValue < 19) return TimeOfDay.EARLY_EVENING;
    if (timeValue >= 19 && timeValue < 22) return TimeOfDay.EVENING;
    if (timeValue >= 22 || timeValue < 1) return TimeOfDay.NIGHT;
    return TimeOfDay.LATE_NIGHT;
  };

  const updateGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeOfDay = getTimeOfDay(hour, minute);
    
    const config = { ...defaultGreetingConfig, ...customConfig };
    const greetingConfig = config[timeOfDay];

    setGreetingData({
      timeOfDay,
      hour,
      minute,
      timestamp: now,
      greeting: greetingConfig.greeting,
      message: greetingConfig.message,
      period: greetingConfig.period
    });
  };

  useEffect(() => {
    updateGreeting();
    const interval = setInterval(updateGreeting, updateInterval);
    return () => clearInterval(interval);
  }, [customConfig, updateInterval]);

  return {
    greetingData,
    updateGreeting,
    isLoading: greetingData === null
  };
};

// 工具函数：获取时间段对应的图标
export const getTimeIcon = (timeOfDay: TimeOfDay) => {
  const iconMap = {
    [TimeOfDay.EARLY_MORNING]: <Sunrise className="w-6 h-6" />,
    [TimeOfDay.MORNING]: <Coffee className="w-6 h-6" />,
    [TimeOfDay.LATE_MORNING]: <Sun className="w-6 h-6" />,
    [TimeOfDay.NOON]: <Sun className="w-6 h-6" />,
    [TimeOfDay.AFTERNOON]: <Sun className="w-6 h-6" />,
    [TimeOfDay.EARLY_EVENING]: <Sunset className="w-6 h-6" />,
    [TimeOfDay.EVENING]: <Moon className="w-6 h-6" />,
    [TimeOfDay.NIGHT]: <Star className="w-6 h-6" />,
    [TimeOfDay.LATE_NIGHT]: <Moon className="w-6 h-6" />
  };
  return iconMap[timeOfDay];
};

// 工具函数：获取时间段对应的样式类
export const getTimeTheme = (timeOfDay: TimeOfDay) => {
  const themeMap = {
    [TimeOfDay.EARLY_MORNING]: {
      bgGradient: 'from-orange-300 via-rose-300 to-pink-300',
      textColor: 'text-gray-800'
    },
    [TimeOfDay.MORNING]: {
      bgGradient: 'from-yellow-300 via-orange-300 to-red-300',
      textColor: 'text-gray-800'
    },
    [TimeOfDay.LATE_MORNING]: {
      bgGradient: 'from-blue-300 via-cyan-300 to-teal-300',
      textColor: 'text-gray-800'
    },
    [TimeOfDay.NOON]: {
      bgGradient: 'from-emerald-300 via-teal-300 to-cyan-300',
      textColor: 'text-gray-800'
    },
    [TimeOfDay.AFTERNOON]: {
      bgGradient: 'from-blue-400 via-purple-400 to-pink-400',
      textColor: 'text-white'
    },
    [TimeOfDay.EARLY_EVENING]: {
      bgGradient: 'from-orange-400 via-red-400 to-pink-400',
      textColor: 'text-white'
    },
    [TimeOfDay.EVENING]: {
      bgGradient: 'from-purple-500 via-indigo-500 to-blue-600',
      textColor: 'text-white'
    },
    [TimeOfDay.NIGHT]: {
      bgGradient: 'from-indigo-600 via-purple-600 to-pink-600',
      textColor: 'text-white'
    },
    [TimeOfDay.LATE_NIGHT]: {
      bgGradient: 'from-gray-700 via-blue-800 to-indigo-900',
      textColor: 'text-white'
    }
  };
  return themeMap[timeOfDay];
};

// 时间问候组件接口
interface TimeGreetingProps {
  className?: string;
  showTime?: boolean;
  showMessage?: boolean;
  variant?: 'default' | 'simple';
  customConfig?: Partial<Record<TimeOfDay, { greeting: string; message: string; period: string }>>;
}

const TimeGreeting: React.FC<TimeGreetingProps> = ({ 
  className = '', 
  showTime = true,
  showMessage = true,
  variant = 'default',
  customConfig 
}) => {
  const { greetingData, isLoading } = useTimeGreeting(customConfig);

  // 加载状态骨架屏
  if (isLoading || !greetingData) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-xl p-6 h-32 ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  // 简洁模式：只显示文本，无装饰
  if (variant === 'simple') {
    return (
      <div className={`${className}`}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {greetingData.greeting}
        </h1>
        
        {showMessage && (
          <p className="text-base md:text-lg text-gray-600 mb-2">
            {greetingData.message}
          </p>
        )}
        
        {showTime && (
          <p className="text-sm text-gray-500">
            {greetingData.timestamp.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </p>
        )}
      </div>
    );
  }

  // 默认模式：完整的卡片样式
  const theme = getTimeTheme(greetingData.timeOfDay);
  const icon = getTimeIcon(greetingData.timeOfDay);

  return (
    <div className={`
      relative overflow-hidden rounded-xl p-6 shadow-lg transition-all duration-1000 ease-in-out
      bg-gradient-to-br ${theme.bgGradient} ${theme.textColor}
      hover:shadow-xl hover:scale-[1.02] transform ${className}
    `}>
      <div className="flex items-center gap-3 mb-3">
        <div className="animate-bounce">{icon}</div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {greetingData.greeting}
        </h1>
      </div>
      
      {showMessage && (
        <p className="text-base md:text-lg opacity-90 mb-3">
          {greetingData.message}
        </p>
      )}
      
      {showTime && (
        <p className="text-sm opacity-75">
          {greetingData.timestamp.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        </p>
      )}
    </div>
  );
};

export default TimeGreeting;
