import { create } from 'zustand';

/**
 * AI 生成任务的全局状态管理
 * 
 * 职责：
 * - 按 docId 跟踪所有正在进行的 AI 生成任务
 * - 统一告知所有文档组件（dialog/sheet/fullscreen）"正在生成、禁止编辑、可取消"等状态
 * - 提供任务生命周期管理：启动、更新、完成、取消、错误处理
 * 
 * 核心设计：
 * - 状态按 docId 索引，任何模式的文档组件都能通过 docId 订阅对应的任务
 * - 任务状态与流式内容写入解耦：action 直接写入内容块表，Store 仅管理 UI 状态
 * - 支持取消操作：通过 AbortController 实现
 */

// 生成任务状态枚举
export type GenerationStatus = 
  | "idle"        // 无任务
  | "starting"    // 正在启动（创建文档、调用 action）
  | "streaming"   // 流式生成中
  | "completed"   // 已完成
  | "cancelled"   // 已取消
  | "error";      // 错误

// 模型配置（对应 convex/_lib/models.ts 的 ModelConfig）
export interface ModelConfig {
  modelName: string;
  provider: string;
  baseURL?: string;
  temperature: number;
  maxTokens: number;
  description: string;
  isRecommended: boolean;
  isFree: boolean;
  shortName: string;
  modelSeries: string;
}

// 生成任务元数据
export interface GenerationJob {
  // 任务唯一标识
  id: string;
  
  // 关联的文档和内容块
  docId: string;
  blockId: string;
  
  // 生成参数（可追溯）
  userPrompt: string;
  modelConfig: ModelConfig;
  systemPrompt?: string;
  contextDocIds: string[];
  
  // 任务状态
  status: GenerationStatus;
  error?: string;
  
  // 任务元数据
  startTime: number;
  endTime?: number;
  
  // 控制器（用于取消）
  abortController?: AbortController;
}

interface GenerationJobState {
  // 所有任务，按 docId 索引
  jobs: Record<string, GenerationJob>;
  
  // ===========================================
  // 公共 API 方法
  // ===========================================
  
  /**
   * 注册一个新的生成任务
   */
  registerJob: (job: Omit<GenerationJob, 'id' | 'startTime' | 'status'>) => string;
  
  /**
   * 更新任务状态
   */
  updateJobStatus: (docId: string, status: GenerationStatus, error?: string) => void;
  
  /**
   * 标记任务完成
   */
  completeJob: (docId: string) => void;
  
  /**
   * 取消任务
   */
  cancelJob: (docId: string) => void;
  
  /**
   * 清理任务（完成或错误后调用）
   */
  cleanupJob: (docId: string, delayMs?: number) => void;
  
  /**
   * 获取指定文档的任务
   */
  getJob: (docId: string) => GenerationJob | undefined;
  
  /**
   * 检查文档是否正在生成（锁定编辑器的判断依据）
   */
  isGenerating: (docId: string) => boolean;
}

/**
 * 生成唯一的任务 ID
 */
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useGenerationJobStore = create<GenerationJobState>((set, get) => ({
  // 初始状态
  jobs: {},

  // 注册新任务
  registerJob: (jobData) => {
    const jobId = generateJobId();
    const job: GenerationJob = {
      ...jobData,
      id: jobId,
      startTime: Date.now(),
      status: 'starting',
      abortController: new AbortController(),
    };

    set((state) => ({
      jobs: {
        ...state.jobs,
        [job.docId]: job,
      },
    }));

    return jobId;
  },

  // 更新任务状态
  updateJobStatus: (docId, status, error) => {
    set((state) => {
      const job = state.jobs[docId];
      if (!job) return state;

      return {
        jobs: {
          ...state.jobs,
          [docId]: {
            ...job,
            status,
            error,
            ...(status === 'completed' || status === 'cancelled' || status === 'error' 
              ? { endTime: Date.now() } 
              : {}
            ),
          },
        },
      };
    });
  },

  // 完成任务
  completeJob: (docId) => {
    get().updateJobStatus(docId, 'completed');
    // 自动清理（延迟 3 秒，让用户看到完成状态）
    get().cleanupJob(docId, 3000);
  },

  // 取消任务
  cancelJob: (docId) => {
    const job = get().jobs[docId];
    if (!job) return;

    // 触发 AbortController（目前 action 层面未实现取消，但保留接口）
    job.abortController?.abort();
    
    // 更新状态为取消
    get().updateJobStatus(docId, 'cancelled');
    
    // 立即清理，解除编辑器锁定
    get().cleanupJob(docId, 100);
  },

  // 清理任务
  cleanupJob: (docId, delayMs = 0) => {
    setTimeout(() => {
      set((state) => {
        const { [docId]: removed, ...remainingJobs } = state.jobs;
        return { jobs: remainingJobs };
      });
    }, delayMs);
  },

  // 获取任务
  getJob: (docId) => {
    return get().jobs[docId];
  },

  // 检查是否正在生成
  isGenerating: (docId) => {
    const job = get().jobs[docId];
    return job?.status === 'starting' || job?.status === 'streaming';
  },
}));

/**
 * Hook: 获取指定文档的生成任务状态
 * 
 * 用于文档组件和编辑器订阅任务状态
 */
export function useGenerationJob(docId: string | null) {
  const job = useGenerationJobStore((state) => 
    docId ? state.jobs[docId] : undefined
  );
  const isGenerating = useGenerationJobStore((state) => 
    docId ? state.isGenerating(docId) : false
  );

  return {
    job,
    isGenerating,
    // 编辑器锁定判断
    isLocked: isGenerating,
  };
}

