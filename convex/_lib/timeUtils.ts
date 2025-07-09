import { Doc } from "../_generated/dataModel";

// 定义会话文档类型，以便在函数中获得类型提示
type Conversation = Doc<"conversations">;

// 定义分组后的结构
export type GroupedConversations = {
  groupName: string;
  conversations: Conversation[];
};

/**
 * 将会话按时间范围分组
 * @param conversations - 要分组的会话数组, 必须按时间倒序排列
 * @returns 分组后的会话数组，每个分组包含组名和会话列表
 */
export const groupConversationsByTime = (
  conversations: Conversation[]
): GroupedConversations[] => {
  if (!conversations || conversations.length === 0) {
    return [];
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const groups: { [key: string]: Conversation[] } = {
    "今天": [],
    "昨天": [],
    "7天内": [],
    "30天内": [],
    "更早": [],
  };

  for (const conv of conversations) {
    const convTime = conv._creationTime;
    if (convTime >= today.getTime()) {
      groups["今天"].push(conv);
    } else if (convTime >= yesterday.getTime()) {
      groups["昨天"].push(conv);
    } else if (convTime >= sevenDaysAgo.getTime()) {
      groups["7天内"].push(conv);
    } else if (convTime >= thirtyDaysAgo.getTime()) {
      groups["30天内"].push(conv);
    } else {
      groups["更早"].push(conv);
    }
  }

  // 这里的目标是将 `groups` 对象转换为一个结构化的数组，方便前端直接使用。
  // 步骤分解:
  // 1. `Object.entries(groups)`:
  //    - 这个方法会将 `groups` 对象（例如 { "今天": [conv1], "昨天": [conv2] }）
  //    - 转换为一个由 [键, 值] 组成的数组（例如 [ ["今天", [conv1]], ["昨天", [conv2]] ]）。
  // 2. `.map(([groupName, conversations]) => ({...}))`:
  //    - `.map` 会遍历上一步生成的数组。
  //    - 对于数组中的每一个元素（如 ["今天", [conv1]]），它使用数组解构赋值 `[groupName, conversations]` 来直接获取键和值。
  //    - 然后，它将这个键值对重新组织成一个结构更清晰的对象 `{ groupName: "今天", conversations: [conv1] }`。
  return Object.entries(groups)
    .map(([groupName, conversations]) => ({
      groupName,
      conversations,
    }))
    .filter((group) => group.conversations.length > 0);
}; 