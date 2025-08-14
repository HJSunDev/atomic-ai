// 定义网格项的数据类型，支持最多两级结构
export interface GridItem {
  id: string;
  title: string;
  content: string;
  color: string;
  children: GridItem[];
}


