export const DEFAULT_DEPENDENCIES = {
  "lucide-react": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "date-fns": "latest",
  "recharts": "latest",
};

export const MOCK_CODE = `import React, { useState } from 'react';
import { Calendar, BarChart3, Users, Bell, Search, Menu, Plus, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const stats = [
    { title: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: BarChart3, color: 'text-blue-500' },
    { title: 'Active Users', value: '2,350', change: '+180.1%', icon: Users, color: 'text-green-500' },
    { title: 'Sales', value: '+12,234', change: '+19%', icon: Calendar, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex" data-id="app-container">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block",
          !isSidebarOpen && "-translate-x-full lg:hidden"
        )}
        data-id="sidebar"
      >
        <div className="h-14 flex items-center px-6 border-b">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">A</div>
            Atomic
          </div>
        </div>
        <div className="p-4 space-y-1">
          {['Overview', 'Analytics', 'Customers', 'Settings'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item.toLowerCase())}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === item.toLowerCase() 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
              data-id={\`nav-item-\${item.toLowerCase()}\`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {item}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 -ml-2 text-gray-500"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 bg-gray-100 px-3 py-1.5 rounded-md w-full max-w-md mx-4">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full" 
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.title} className="p-6 bg-white rounded-xl border shadow-sm" data-id="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">{stat.title}</span>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.change} from last month</p>
              </div>
            ))}
          </div>

          {/* Recent Activity Area */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl border shadow-sm p-6 min-h-[300px]">
              <h3 className="font-semibold mb-4">Overview</h3>
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                Chart Placeholder
              </div>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-6 min-h-[300px]">
              <h3 className="font-semibold mb-4">Recent Sales</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-gray-100" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">User {i}</p>
                      <p className="text-xs text-gray-500">user{i}@example.com</p>
                    </div>
                    <div className="text-sm font-medium">+$1,999.00</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
`;

