export interface FolderDetailSubfolder {
  name: string;
  items: number;
  size: string;
}

export interface FolderDetailFile {
  id: string | undefined;
  name: string;
  type: string;
  size: string;
  modified: string;
  tags: string[];
  color: string;
}
