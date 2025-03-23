export interface Bookmark {
  id: string;
  title: string;
  url: string;
  children?: Bookmark[];
  parentId?: string;
  dateAdded?: number;
  dateGroupModified?: number;
  index?: number;
}

export interface BookmarkFolder {
  id: string;
  title: string;
  children: (Bookmark | BookmarkFolder)[];
  parentId?: string;
  dateAdded?: number;
  dateGroupModified?: number;
  index?: number;
}

export interface Options {
  theme: 'light' | 'dark';
  sortBy: 'date' | 'name' | 'url';
  layout: 'grid' | 'list';
}

// Chrome Bookmarks API 类型
export interface ChromeBookmarkTreeNode {
  id: string;
  parentId?: string;
  index?: number;
  url?: string;
  title: string;
  dateAdded?: number;
  dateGroupModified?: number;
  children?: ChromeBookmarkTreeNode[];
}

export const convertToBookmark = (node: ChromeBookmarkTreeNode): Bookmark | BookmarkFolder => {
  const base = {
    id: node.id,
    title: node.title,
    parentId: node.parentId,
    dateAdded: node.dateAdded || 0,
    dateGroupModified: node.dateGroupModified || 0,
    index: node.index || 0,
  };

  if (node.url) {
    return {
      ...base,
      url: node.url,
      children: node.children?.map(convertToBookmark),
    } as Bookmark;
  }

  return {
    ...base,
    children: (node.children || []).map(convertToBookmark),
  } as BookmarkFolder;
};
