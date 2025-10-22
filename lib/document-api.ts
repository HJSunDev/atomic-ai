// 为了在组件内按需获取真实文档数据，这里提供一个占位的异步请求函数。
// 该函数当前返回固定内容，后续可以替换为实际的后端请求。

export interface PromptDocument {
  id: string;
  title: string;
  description: string;
  content: string;
}

// 占位请求：根据文档ID返回固定内容
export async function fetchDocumentById(documentId: string): Promise<PromptDocument> {
  // 这里返回静态内容，便于在功能联调前完成组件重构。
  return Promise.resolve({
    id: documentId,
    title: `占位标题（ID: ${documentId}）`,
    description: '这是占位描述，用于演示通过ID加载文档内容。',
    content: '<p>这是占位正文内容。后续会接入真实数据源。</p>',
  });
}


