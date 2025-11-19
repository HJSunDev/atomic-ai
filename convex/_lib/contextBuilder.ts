/**
 * 定义上下文构建器所需的数据结构
 */
interface ContextParts {
  coreTask?: string;
  specification?: string;
  backgroundInfo?: string;
  userInput: string; // 用户输入是必需的
}

/**
 * 上下文构建器
 * 采用 Builder 模式，用于动态、结构化地构建提供给 LLM 的输入。
 * 它将不同类型的信息（如核心任务、背景资料、用户输入）分离，
 * 然后按照预设的模板组合成一个清晰、结构化的字符串。
 */
export class ContextBuilder {
  private parts: ContextParts;

  /**
   * @param userInput 用户的原始输入消息，这是构建上下文的基础。
   */
  constructor(userInput: string) {
    this.parts = { userInput };
  }

  /**
   * 添加“核心任务”
   * @param task 描述 AI 需要完成的最顶层目标。
   */
  public withCoreTask(task: string | null | undefined): this {
    if (task) {
      if (this.parts.coreTask) {
        this.parts.coreTask += `\n\n---\n\n${task}`;
      } else {
        this.parts.coreTask = task;
      }
    }
    return this;
  }

  /**
   * 添加“输出规范”
   * @param spec 描述 AI 输出需要遵循的格式、标准或约束。
   */
  public withSpecification(spec: string | null | undefined): this {
    if (spec) {
      if (this.parts.specification) {
        this.parts.specification += `\n\n---\n\n${spec}`;
      } else {
        this.parts.specification = spec;
      }
    }
    return this;
  }

  /**
   * 添加通用的“背景信息”
   * @param info 提供完成任务所需的任何附加上下文。支持多次调用以追加信息。
   */
  public withBackgroundInfo(info: string | null | undefined): this {
    if (info) {
      if (this.parts.backgroundInfo) {
        // 使用空行和分隔线来区分多个背景信息块
        this.parts.backgroundInfo += `\n\n---\n\n${info}`;
      } else {
        this.parts.backgroundInfo = info;
      }
    }
    return this;
  }

  /**
   * 根据指定类型，添加一个文档作为上下文。
   * 
   * 差异化处理策略：
   * - 核心任务/输出规范：直接拼接内容，去除任何标题或来源标注，确保指令纯粹、直接。
   * - 背景信息：保留标题包装，帮助 AI 区分不同的参考资料来源。
   * 
   * @param title 文档的标题。
   * @param content 文档的主体内容。
   * @param type 文档的意图类型，决定其在最终提示中的角色。
   */
  public withDocument(
    title: string,
    content: string | null | undefined,
    type: "core_task" | "specification" | "background_info"
  ): this {
    if (content) {
      switch (type) {
        case "core_task":
          // 任务是指令，直接拼接内容，避免“来自文档”等包装词造成困惑
          this.withCoreTask(content);
          break;
        case "specification":
          // 规范也是指令，直接拼接
          this.withSpecification(content);
          break;
        case "background_info":
        default:
          // 背景信息保留来源标注，作为参考资料提供
          const formattedDocument = `--- 参考资料: ${title} ---\n${content}`;
          this.withBackgroundInfo(formattedDocument);
          break;
      }
    }
    return this;
  }

  /**
   * 构建最终的、结构化的输入字符串。
   * @returns 按照预设模板格式化后的完整字符串，可直接作为 LLM 的输入。
   */
  public build(): string {
    const template: string[] = [];

    // 各部分遵循预设的顺序和格式
    if (this.parts.coreTask) {
      template.push(`【核心任务】\n${this.parts.coreTask}`);
    }
    if (this.parts.specification) {
      template.push(`【输出规范】\n${this.parts.specification}`);
    }
    if (this.parts.backgroundInfo) {
      template.push(`【背景信息】\n${this.parts.backgroundInfo}`);
    }

    // 用户输入总是放在最后，作为最直接的指令
    template.push(`【用户输入】\n${this.parts.userInput}`);

    // 使用双换行符分隔各个主要部分，以获得更好的可读性和结构
    return template.join("\n\n");
  }
}
