"use client";

import { 
  FileText, 
  Calendar, 
  Clock, 
  Users, 
  LayoutGrid, 
  Sun, 
  Coffee, 
  BookOpen, 
  Plus 
} from 'lucide-react';

import { WelcomePanel } from "./_components/WelcomePanel";
import { DocumentViewer } from "../_prompt-studio/_components/DocumentViewer";
import { RecentlyVisited } from './_components/RecentlyVisited';
import TimeGreeting from "@/components/time-greeting/TimeGreeting";

export const HomeModule = () => {
  return (
    <main className="relative w-full h-full bg-white overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
         <header className="mb-10">
           <TimeGreeting 
             variant="simple"
             className="max-w-2xl" 
             showTime={true} 
             showMessage={true}
           />
         </header>

        {/* Recently Visited */}
        <RecentlyVisited />

        {/* Upcoming Events */}
        <section className="mb-12">
          <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming events
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Connect AI Meeting Notes with your Calendar events</h3>
              <p className="text-sm text-gray-500 my-2">Join calls, transcribe audio, and summarize meetings all in Notion.</p>
              <button className="text-sm text-blue-600 font-medium mt-2">Connect Notion Calendar</button>
            </div>
            <div className="pt-2">
              <div className="flex items-start mb-4">
                <div className="text-sm text-gray-500 w-20">
                  <p>Today</p>
                  <p>Sep 11</p>
                </div>
                <div className="border-l-2 border-gray-200 pl-4">
                  <p className="font-medium">Team standup</p>
                  <p className="text-sm text-gray-500">9 AM · Office</p>
                  <button className="mt-2 text-sm bg-gray-100 border border-gray-200 rounded-md px-3 py-1 text-gray-600 flex items-center">
                    <Plus className="w-4 h-4 mr-1"/> Join and take notes
                  </button>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-sm text-gray-500 w-20">
                  <p>Fri</p>
                  <p>Sep 12</p>
                </div>
                <div className="border-l-2 border-gray-200 pl-4">
                  <p className="font-medium">Project check-in</p>
                  <p className="text-sm text-gray-500">10 AM · Office</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Home views */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Home views
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg mb-4">
                 <LayoutGrid className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">Pin a database view to quickly access it from Home.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>Activity</span>
                <span>Status</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center"><Sun className="w-4 h-4 mr-2 text-yellow-500"/> Wake up and freshen up</span>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Done</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center"><Coffee className="w-4 h-4 mr-2 text-orange-500"/> Have breakfast</span>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded">In progress</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center"><BookOpen className="w-4 h-4 mr-2 text-gray-500"/> Work or study</span>
                   <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Not started</span>
                </div>
              </div>
            </div>
          </div>
        </section>


      {/* 欢迎面板 */}
      <WelcomePanel />


      {/* 全局挂载区 */}
      {/* 文档视图容器 */}
      <DocumentViewer />



      </div>
    </main>
  );
};
