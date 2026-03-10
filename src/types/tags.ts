export interface TagItem {
  id: string;
  name: string;
  count: number;
  color: string;
}

export interface TaggedContentItem {
  id: string;
  name: string;
  type: "file" | "folder";
  tag: string;
  tagId?: string;
  size?: string;
  items?: number;
  date: string;
}
