export interface FolderItem {
  id: string;
  slug?: string;
  name: string;
  items: number;
  size: string;
  modified: string;
  shared: boolean;
  tags: string[];
}
