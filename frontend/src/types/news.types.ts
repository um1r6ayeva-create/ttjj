export interface News {
  id: number;
  title: string;
  date: string;
  category: string;
  content: string;
  fullContent: string;
  author: {
    name: string;
    position: string;
    avatar: string;
  };
  icon: string;
}