import { Node } from '@tiptap/pm/model';
import { getSchema } from '@tiptap/core';
import { MarkdownSerializer, defaultMarkdownSerializer } from '@tiptap/pm/markdown';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

/**
 * 创建与 TiptapEditor 一致的 schema，用于解析 JSON 数据
 * 使用与编辑器相同的扩展配置，确保节点类型匹配
 */
const createSchema = () => {
  return getSchema([
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    Placeholder.configure({
      placeholder: '',
    }),
  ]);
};

/**
 * 创建支持 Tiptap 节点名称的 Markdown 序列化器
 * 
 * Tiptap 使用驼峰命名（bulletList, orderedList），而 prosemirror-markdown 使用下划线命名（bullet_list, ordered_list）
 * 需要将 Tiptap 的节点名称映射到对应的序列化处理函数
 */
const createTolerantSerializer = (strict: boolean = false): MarkdownSerializer => {
  // 复用 defaultMarkdownSerializer 的所有节点处理函数
  const nodes = { ...defaultMarkdownSerializer.nodes };
  
  // 添加 Tiptap 节点名称的映射（映射到相同的处理函数）
  // bulletList -> bullet_list 的处理函数
  if (nodes.bullet_list) {
    nodes.bulletList = nodes.bullet_list;
  }
  
  // orderedList 需要特殊处理：Tiptap 使用 attrs.start，而 prosemirror-markdown 期望 attrs.order
  if (nodes.ordered_list) {
    nodes.orderedList = (state, node) => {
      // 适配 Tiptap 的 start 属性，如果存在则使用，否则使用 order，默认值为 1
      const start = node.attrs.start ?? node.attrs.order ?? 1;
      const maxW = String(start + node.childCount - 1).length;
      const space = state.repeat(" ", maxW + 2);
      state.renderList(node, space, i => {
        const nStr = String(start + i);
        return state.repeat(" ", maxW - nStr.length) + nStr + ". ";
      });
    };
  }
  
  // listItem -> list_item 的处理函数
  if (nodes.list_item) {
    nodes.listItem = nodes.list_item;
  }
  
  // hardBreak -> hard_break 的处理函数（如果存在）
  if (nodes.hard_break) {
    nodes.hardBreak = nodes.hard_break;
  }
  
  // codeBlock -> code_block 的处理函数（如果存在）
  if (nodes.code_block) {
    nodes.codeBlock = nodes.code_block;
  }
  
  // horizontalRule -> horizontal_rule 的处理函数（如果存在）
  if (nodes.horizontal_rule) {
    nodes.horizontalRule = nodes.horizontal_rule;
  }
  
  return new MarkdownSerializer(
    nodes,
    defaultMarkdownSerializer.marks,
    {
      strict,
    }
  );
};

/**
 * 将 Tiptap JSON 格式的文档内容转换为 Markdown 字符串
 * 
 * 使用场景：从数据库取出 JSON 格式数据，处理为 MD 内容
 * 
 * @param jsonContent - Tiptap 编辑器生成的 JSON 对象或 JSON 字符串
 * @param options - 可选配置项
 * @param options.strict - 是否启用严格模式，默认为 false（遇到未知节点类型时忽略而不是报错）
 * @param options.tightLists - 是否使用紧凑列表格式，默认为 false
 * @returns 转换后的 Markdown 字符串，如果转换失败则返回空字符串
 * 
 * @example
 * ```typescript
 * const json = { type: 'doc', content: [...] };
 * const markdown = jsonToMarkdown(json);
 * ```
 */
export function jsonToMarkdown(
  jsonContent: object | string,
  options: {
    strict?: boolean;
    tightLists?: boolean;
  } = {}
): string {
  try {
    // 如果输入是字符串，尝试解析为 JSON
    let json: any;
    if (typeof jsonContent === 'string') {
      if (!jsonContent.trim()) {
        return '';
      }
      try {
        json = JSON.parse(jsonContent);
      } catch {
        // JSON 解析失败，返回空字符串
        return '';
      }
    } else {
      json = jsonContent;
    }

    // 验证 JSON 结构是否有效
    if (!json || typeof json !== 'object' || !('type' in json)) {
      return '';
    }

    // 创建 schema（与编辑器保持一致）
    const schema = createSchema();

    // 将 JSON 转换为 Prosemirror Node
    let prosemirrorNode: Node;
    try {
      prosemirrorNode = Node.fromJSON(schema, json);
    } catch (error) {
      // 容错：如果节点创建失败，返回空字符串
      console.warn('Failed to create Prosemirror node from JSON:', error);
      return '';
    }

    // 创建支持容错的序列化器（strict: false 时，未知节点和标记会被忽略而不是报错）
    const serializer = createTolerantSerializer(options.strict ?? false);
    
    // 序列化为 Markdown
    const markdown = serializer.serialize(prosemirrorNode, {
      tightLists: options.tightLists ?? false,
    });

    return markdown;
  } catch (error) {
    // 顶层容错：捕获所有未预期的错误，返回空字符串而不是抛出异常
    console.error('Error converting JSON to Markdown:', error);
    return '';
  }
}

