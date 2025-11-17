import { Node } from '@tiptap/pm/model';
import { getSchema } from '@tiptap/core';
import { MarkdownSerializer, defaultMarkdownSerializer } from '@tiptap/pm/markdown';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TurndownService from 'turndown';
import { generateHTML, generateJSON } from '@tiptap/html';
import { Extension } from '@tiptap/core';
import { gfm } from 'turndown-plugin-gfm';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { AnyExtension } from '@tiptap/core';
import { marked } from 'marked';

/**
 * 统一获取与编辑器一致的扩展配置
 * 所有 JSON/HTML/Markdown 之间的转换都应复用此配置，避免各处手动维护导致不一致。
 */
const getEditorExtensions = (): AnyExtension[] => [
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
  // 表格扩展
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableCell,
  TableHeader,
];

/**
 * 创建与 TiptapEditor 一致的 schema，用于解析 JSON 数据
 * 使用与编辑器相同的扩展配置，确保节点类型匹配
 */
const createSchema = () => {
  const extensions: AnyExtension[] = getEditorExtensions();
  return getSchema(extensions);
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



/**
 * 将 Tiptap JSON 内容高效、健壮地转换为 Markdown 字符串 (V2 实现)。
 *
 * **转换流程**:
 * 1.  `JSON → HTML`: 使用 Tiptap 官方的 `generateHTML` 函数，确保与编辑器渲染一致。
 * 2.  `HTML → Markdown`: 使用 `turndown` 库，将 HTML 精确转换为 Markdown。
 *
 * **优势**:
 * - **零维护成本**: 当 Tiptap 编辑器增加新扩展（如表格、任务列表）时，此函数无需任何修改即可自动支持。
 * - **高保真度**: 转换结果能最大程度地还原编辑器的视觉表现。
 * - **技术栈成熟**: 完全依赖于 Tiptap 官方库和业界广泛使用的 `turndown`。
 *
 * @param jsonContent - Tiptap 编辑器生成的 JSON 对象或 JSON 字符串。
 * @param turndownOptions - (可选) `turndown` 库的配置选项，用于自定义 Markdown 输出格式。
 * @returns 转换后的 Markdown 字符串，如果失败则返回空字符串。
 *
 * @example
 * ```typescript
 * const json = { type: 'doc', content: [...] };
 * const markdown = jsonToMarkdownV2(json);
 * ```
 */
export function jsonToMarkdownV2(
  jsonContent: object | string,
  turndownOptions?: TurndownService.Options
): string {
  try {
    // 1. 标准化输入：确保我们处理的是一个对象
    let json: any;
    if (typeof jsonContent === 'string') {
      if (!jsonContent.trim()) return '';
      try {
        json = JSON.parse(jsonContent);
      } catch {
        // 如果解析失败，可能不是有效的 JSON，直接返回空字符串
        return '';
      }
    } else {
      json = jsonContent;
    }

    // 2. 验证 JSON 结构
    if (!json || typeof json !== 'object' || !json.type) {
      return '';
    }

    // 3. 获取与编辑器一致的 Tiptap 扩展配置
    // 注意：这里的扩展列表必须与 TiptapEditor 和 DocumentForm 中的 `generateJSON` 保持同步
    const extensions: AnyExtension[] = getEditorExtensions();

    // 4. JSON -> HTML: 使用 Tiptap 官方工具转换
    const html = generateHTML(json, extensions);

    // 5. HTML -> Markdown: 使用 turndown 及其 GFM 插件进行转换
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      ...turndownOptions,
    });

    // 使用 GFM 插件，它会自动处理表格、删除线、任务列表和带语言的高亮代码块
    turndownService.use(gfm);

    // 自定义规则 1：处理表格单元格中的 <p> 标签，避免多余换行破坏表格结构
    turndownService.addRule('tableCellParagraphs', {
      filter(node) {
        // 仅匹配位于 TH/TD 内部的段落标签
        return node.nodeName === 'P' && !!node.parentNode?.nodeName.match(/^(TH|TD)$/);
      },
      replacement(content) {
        // 直接返回内容，不添加任何额外的换行符
        return content;
      },
    });

    // 自定义规则 2：将 Tiptap 生成的 HTML 表格转换为 GFM 风格的 Markdown 表格
    turndownService.addRule('tiptapTable', {
      filter(node) {
        return node.nodeName === 'TABLE';
      },
      replacement(content, node) {
        try {
          // 额外防御：如果当前环境的节点不支持 querySelectorAll，则回退为默认内容
          const table = node as HTMLElement;
          const canQuery =
            typeof (table as any).querySelectorAll === 'function' &&
            typeof (table as any).querySelector === 'function';
          if (!canQuery) {
            return content || '\n';
          }

          const rows = Array.from(table.querySelectorAll('tr')) as HTMLElement[];
          if (!rows.length) {
            return '\n';
          }

          // 处理表头行：优先使用 TH，如果没有则使用第一行的 TD
          const headerCells = Array.from(
            rows[0].querySelectorAll('th,td'),
          ) as HTMLElement[];
          const headerTexts = headerCells.map((cell) => {
            const cellHtml = cell.innerHTML;
            // 使用同一个 turndown 实例转换单元格内容，以保留加粗等内联格式
            const md = turndownService
              .turndown(cellHtml)
              .replace(/\n+/g, ' ')
              .trim();
            return md || ' ';
          });

          const columnCount = headerTexts.length || 1;

          // 生成表头和分隔行
          const headerLine = `| ${headerTexts.join(' | ')} |`;
          const separatorLine = `| ${Array(columnCount)
            .fill('---')
            .join(' | ')} |`;

          // 处理数据行
          const bodyLines: string[] = [];
          const dataRows = rows.slice(1);

          for (const row of dataRows) {
            const cells = Array.from(
              row.querySelectorAll('td,th'),
            ) as HTMLElement[];
            const cellTexts = cells.map((cell) => {
              const cellHtml = cell.innerHTML;
              const md = turndownService
                .turndown(cellHtml)
                .replace(/\n+/g, ' ')
                .trim();
              return md || ' ';
            });

            // 如果某些行少于表头列数，用空字符串补齐，保证列数一致
            while (cellTexts.length < columnCount) {
              cellTexts.push(' ');
            }

            const rowLine = `| ${cellTexts
              .slice(0, columnCount)
              .join(' | ')} |`;
            bodyLines.push(rowLine);
          }

          const tableMarkdown = ['\n', headerLine, separatorLine, ...bodyLines, '\n'].join(
            '\n',
          );
          return tableMarkdown;
        } catch (error) {
          // 防御性回退：任何内部异常都不会让调用方崩溃，直接退回到已有内容
          console.warn('tiptapTable rule failed, fallback to content:', error);
          return content || '\n';
        }
      },
    });
    
    const markdown = turndownService.turndown(html);

    return markdown;

  } catch (error) {
    console.error('Error converting JSON to Markdown (V2):', error);
    return '';
  }
}

/**
 * 将 Markdown 字符串转换为 Tiptap JSON 文档结构
 *
 * 转换流程：
 * 1. Markdown -> HTML（使用 marked）
 * 2. HTML -> Tiptap JSON（使用 generateJSON + 与编辑器一致的扩展配置）
 *
 * 设计目标：
 * - 与编辑器使用的扩展保持完全一致，避免出现“某些节点能编辑但不能解析”的情况
 * - 出错时不抛异常，而是返回 null，由调用方决定后续处理策略
 */
export function markdownToTiptapJSON(
  markdown: string,
  options: {
    trim?: boolean;
  } = {},
): any | null {
  try {
    if (!markdown) {
      return null;
    }

    const shouldTrim = options.trim ?? true;
    const source = shouldTrim ? markdown.trim() : markdown;

    if (!source) {
      return null;
    }

    // 1. Markdown -> HTML
    const html = marked.parse(source) as string;
    if (!html || !html.trim()) {
      return null;
    }

    // 2. HTML -> Tiptap JSON（使用与编辑器一致的扩展）
    const extensions: AnyExtension[] = getEditorExtensions();
    const json = generateJSON(html, extensions) as any;

    if (!json || typeof json !== 'object') {
      return null;
    }

    // 不强制要求 type === 'doc'，以兼容未来可能的根节点扩展
    return json;
  } catch (error) {
    console.error('[markdownToTiptapJSON] Error converting Markdown to Tiptap JSON:', error);
    return null;
  }
}

