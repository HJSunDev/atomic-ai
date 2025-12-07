
export type DiscoveryItemType = 'prompt' | 'app';

export interface DiscoveryItem {
  id: string;
  type: DiscoveryItemType;
  title: string;
  description: string; // For apps, this is description. For prompts, this is content preview.
  author: {
    name: string;
    avatar?: string;
  };
  stats: {
    views?: number;
    likes?: number;
    clones?: number;
  };
  tags: string[];
  createdAt: string;
}

export const MOCK_DISCOVERY_ITEMS: DiscoveryItem[] = [
  {
    id: '1',
    type: 'prompt',
    title: 'SEO Blog Post Generator',
    description: 'Write a comprehensive, SEO-optimized blog post about [TOPIC]. Include h2, h3 tags, and focus on [KEYWORD]. The tone should be professional yet engaging.',
    author: {
      name: 'Alice Johnson',
    },
    stats: {
      likes: 120,
      clones: 45
    },
    tags: ['Marketing', 'Writing', 'SEO'],
    createdAt: '2023-10-25'
  },
  {
    id: '2',
    type: 'app',
    title: 'Resume Builder Pro',
    description: 'An AI-powered application to generate professional resumes based on your LinkedIn profile export.',
    author: {
      name: 'David Smith',
    },
    stats: {
      views: 3400,
      likes: 89
    },
    tags: ['Productivity', 'Career'],
    createdAt: '2023-11-02'
  },
  {
    id: '3',
    type: 'prompt',
    title: 'React Component Refactor',
    description: 'Analyze the following React component and suggest improvements for performance and readability. Use functional components and hooks.',
    author: {
      name: 'CodeMaster',
    },
    stats: {
      likes: 230,
      clones: 110
    },
    tags: ['Coding', 'React', 'Refactoring'],
    createdAt: '2023-10-28'
  },
  {
    id: '4',
    type: 'app',
    title: 'Weekly Meal Planner',
    description: 'Generate a healthy weekly meal plan based on your dietary restrictions and favorite cuisines. Includes shopping list.',
    author: {
      name: 'Sarah Lee',
    },
    stats: {
      views: 1200,
      likes: 56
    },
    tags: ['Lifestyle', 'Health', 'Food'],
    createdAt: '2023-11-05'
  },
  {
    id: '5',
    type: 'prompt',
    title: 'Email Polisher',
    description: 'Rewrite this email to be more polite and professional. Fix any grammar errors and improve flow.',
    author: {
      name: 'BusinessPro',
    },
    stats: {
      likes: 85,
      clones: 30
    },
    tags: ['Business', 'Email', 'Communication'],
    createdAt: '2023-11-01'
  },
  {
    id: '6',
    type: 'app',
    title: 'Logo Concept Generator',
    description: 'Describe your brand and get 5 creative logo concepts with color palettes and design rationale.',
    author: {
      name: 'DesignGuru',
    },
    stats: {
      views: 5600,
      likes: 210
    },
    tags: ['Design', 'Branding', 'Creative'],
    createdAt: '2023-11-08'
  },
    {
    id: '7',
    type: 'prompt',
    title: 'Python Script Explainer',
    description: 'Explain what this Python script does step-by-step. Identify any potential security vulnerabilities.',
    author: {
      name: 'PyDev',
    },
    stats: {
      likes: 150,
      clones: 60
    },
    tags: ['Coding', 'Python', 'Security'],
    createdAt: '2023-10-30'
  },
  {
    id: '8',
    type: 'app',
    title: 'Dream Interpreter',
    description: 'Describe your dream and receive a Jungian analysis of its potential meanings and symbols.',
    author: {
      name: 'MysticMind',
    },
    stats: {
      views: 800,
      likes: 42
    },
    tags: ['Fun', 'Psychology'],
    createdAt: '2023-11-09'
  }
];

