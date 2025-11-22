/**
 * 模拟 AI 代码生成器
 * 用于前端演示，无需后端支持
 */

interface GenerateResult {
  code: string;
  message: string;
}

// 预定义的模板库，根据关键词匹配
const TEMPLATES: Record<string, GenerateResult> = {
  "任务管理": {
    code: `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GeneratedApp() {
  const [tasks, setTasks] = useState([
    { id: 1, title: '设计系统架构', status: 'todo', priority: 'high' },
    { id: 2, title: '实现用户认证', status: 'in-progress', priority: 'high' },
    { id: 3, title: '编写测试用例', status: 'done', priority: 'medium' },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, {
      id: Date.now(),
      title: newTask,
      status: 'todo',
      priority: 'medium'
    }]);
    setNewTask('');
  };

  const toggleStatus = (id: number) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newStatus = task.status === 'todo' ? 'in-progress' : 
                         task.status === 'in-progress' ? 'done' : 'todo';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'todo':
        return { label: '待办', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'in-progress':
        return { label: '进行中', color: 'bg-blue-100 text-blue-700 border-blue-300' };
      case 'done':
        return { label: '已完成', color: 'bg-green-100 text-green-700 border-green-300' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8" data-aid="app-container">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2" data-aid="header">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            任务管理看板
          </h1>
          <p className="text-muted-foreground">高效管理你的日常任务</p>
        </header>

        <Card data-aid="add-task-card">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="添加新任务..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="flex-1"
                data-aid="task-input"
              />
              <Button onClick={addTask} data-aid="add-task-btn">
                <Plus className="w-4 h-4 mr-2" />
                添加
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3" data-aid="task-columns">
          {['todo', 'in-progress', 'done'].map(status => {
            const config = getStatusConfig(status);
            const statusTasks = tasks.filter(task => task.status === status);
            
            return (
              <div key={status} className="space-y-3" data-aid={\`column-\${status}\`}>
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    {status === 'todo' && <Clock className="w-4 h-4" />}
                    {status === 'in-progress' && <Clock className="w-4 h-4 animate-pulse text-blue-500" />}
                    {status === 'done' && <Check className="w-4 h-4 text-green-500" />}
                    {config.label}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {statusTasks.length}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {statusTasks.map(task => (
                    <Card 
                      key={task.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer group"
                      data-aid={\`task-\${task.id}\`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <p className={cn(
                              "text-sm font-medium",
                              task.status === 'done' && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={cn("text-xs", getPriorityColor(task.priority))}>
                                ● {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleStatus(task.id)}
                              className="p-1.5 hover:bg-slate-100 rounded"
                              title="切换状态"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 hover:bg-red-50 rounded text-red-600"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {statusTasks.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                      暂无任务
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}`,
    message: "✅ 已为你生成任务管理看板应用！包含了任务添加、状态切换、优先级标记等功能。"
  },

  "数据统计": {
    code: `import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GeneratedApp() {
  const stats = [
    { 
      title: '总收入', 
      value: '¥45,231', 
      change: '+20.1%', 
      trend: 'up',
      icon: DollarSign, 
      color: 'text-green-600 bg-green-50' 
    },
    { 
      title: '活跃用户', 
      value: '2,350', 
      change: '+18.2%', 
      trend: 'up',
      icon: Users, 
      color: 'text-blue-600 bg-blue-50' 
    },
    { 
      title: '订单数量', 
      value: '1,234', 
      change: '-4.3%', 
      trend: 'down',
      icon: ShoppingCart, 
      color: 'text-purple-600 bg-purple-50' 
    },
    { 
      title: '增长率', 
      value: '15.3%', 
      change: '+5.2%', 
      trend: 'up',
      icon: TrendingUp, 
      color: 'text-orange-600 bg-orange-50' 
    },
  ];

  const recentActivities = [
    { id: 1, user: '张三', action: '完成了订单 #1234', time: '2 分钟前', avatar: '👨' },
    { id: 2, user: '李四', action: '注册了新账户', time: '15 分钟前', avatar: '👩' },
    { id: 3, user: '王五', action: '发起了退款申请', time: '1 小时前', avatar: '🧑' },
    { id: 4, user: '赵六', action: '购买了会员', time: '3 小时前', avatar: '👨‍💼' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8" data-aid="app-container">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2" data-aid="header">
          <h1 className="text-3xl font-bold">数据统计面板</h1>
          <p className="text-muted-foreground">实时业务数据概览</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-aid="stats-grid">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow" data-aid={\`stat-card-\${index}\`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                  <div className={cn("p-2 rounded-lg", stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      stat.trend === 'up' ? "text-green-600" : "text-red-600"
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs 上月</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card data-aid="chart-card">
            <CardHeader>
              <CardTitle>销售趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">图表占位区域</p>
              </div>
            </CardContent>
          </Card>

          <Card data-aid="activity-card">
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.user}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}`,
    message: "✅ 已为你生成数据统计面板！包含关键指标卡片、趋势分析和实时活动流。"
  },

  "用户管理": {
    code: `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Search, UserPlus, Mail, Phone, MoreVertical } from 'lucide-react';

export default function GeneratedApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useState([
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', status: 'active', avatar: '👨‍💼' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: 'user', status: 'active', avatar: '👩‍💻' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: 'user', status: 'inactive', avatar: '🧑‍🔬' },
    { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: 'moderator', status: 'active', avatar: '👨‍🎨' },
  ]);

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; variant: any }> = {
      admin: { label: '管理员', variant: 'default' },
      moderator: { label: '版主', variant: 'secondary' },
      user: { label: '用户', variant: 'outline' },
    };
    return config[role] || { label: role, variant: 'outline' };
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-500' : 'text-gray-400';
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8" data-aid="app-container">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center" data-aid="header">
          <div>
            <h1 className="text-3xl font-bold">用户管理</h1>
            <p className="text-muted-foreground mt-1">管理系统用户和权限</p>
          </div>
          <Button className="gap-2" data-aid="add-user-btn">
            <UserPlus className="w-4 h-4" />
            添加用户
          </Button>
        </header>

        <Card data-aid="search-card">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名或邮箱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select className="w-40">
                <option>全部角色</option>
                <option>管理员</option>
                <option>版主</option>
                <option>用户</option>
              </Select>
              <Select className="w-40">
                <option>全部状态</option>
                <option>活跃</option>
                <option>停用</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card data-aid="users-table">
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4"
                  data-aid={\`user-row-\${user.id}\`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                    {user.avatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{user.name}</h3>
                      <Badge variant={getRoleBadge(user.role).variant} className="text-xs">
                        {getRoleBadge(user.role).label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={\`w-2 h-2 rounded-full \${getStatusColor(user.status)}\`}>●</span>
                        {user.status === 'active' ? '活跃' : '停用'}
                      </span>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          共 {filteredUsers.length} 个用户
        </div>
      </div>
    </div>
  );
}`,
    message: "✅ 已为你生成用户管理后台！包含用户列表、搜索过滤和角色管理功能。"
  },
};

/**
 * 根据模板 key 返回对应的代码
 * @param templateKey 模板标识："任务管理" | "数据统计" | "用户管理"
 */
export function mockGenerateCode(templateKey: string): GenerateResult {
  // 直接通过 key 访问模板，如果不存在则返回第一个模板
  return TEMPLATES[templateKey] || TEMPLATES['任务管理'];
}

