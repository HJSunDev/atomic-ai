import React from "react";

// 聊天模块组件
export const ChatModule = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">聊天</h2>
      <p className="text-gray-600 dark:text-gray-300">这里是AI聊天界面，您可以与AI进行自然语言对话。</p>
      
      {/* 聊天记录区域 */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg h-[400px] overflow-y-auto">
        <div className="text-sm text-gray-500 dark:text-gray-400">聊天记录将显示在这里</div>
      </div>
      
      {/* 输入区域 */}
      <div className="mt-4 flex gap-2">
        <input 
          type="text" 
          placeholder="请输入您的问题..." 
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          发送
        </button>
      </div>
    </div>
  );
};
