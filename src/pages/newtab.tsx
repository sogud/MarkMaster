import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import styles from "./newtab.module.css";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  MeasuringStrategy,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { getFaviconFromCache } from "../utils/utils";
import {
  BookmarkFolder,
  Bookmark,
  convertToBookmark,
  ChromeBookmarkTreeNode,
} from "../types";
import Folder from "../components/Folder";
import Button from "../components/Button";
import SortableItem from "../components/SortableItem";
import SearchBar, { SearchBarRef } from "../components/SearchBar";
import ViewToggle from "../components/ViewToggle";

import Link from "../components/Link";

const EditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  title: string;
}> = ({ isOpen, onClose, onSave, title }) => {
  const [inputTitle, setInputTitle] = useState(title);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>编辑书签</h2>
        <input
          type="text"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          className={styles.modalInput}
        />
        <div className={styles.modalFooter}>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={() => onSave(inputTitle)}>保存</Button>
        </div>
      </div>
    </div>
  );
};

function Newtab() {
  const [currentFolder, setCurrentFolder] = useState<BookmarkFolder>({
    id: "",
    title: "",
    children: [],
    dateAdded: 0,
    dateGroupModified: 0,
    index: 0,
  });

  const [folderHistory, setFolderHistory] = useState<BookmarkFolder[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<
    (Bookmark | BookmarkFolder)[]
  >([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchBarRef = useRef<SearchBarRef>(null);
  // 用于跟踪最近删除的书签，避免事件监听器重复处理
  const recentlyDeletedRef = useRef<{id: string, timestamp: number}[]>([]);

  // 全局搜索函数
  const performSearch = (query: string, folder: BookmarkFolder) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    const searchBookmarks = (
      searchQuery: string,
      searchFolder: BookmarkFolder
    ): (Bookmark | BookmarkFolder)[] => {
      let results: (Bookmark | BookmarkFolder)[] = [];
      
      for (const item of searchFolder.children) {
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push(item);
        }
        
        if (!("url" in item) && item.children) {
          results = [
            ...results,
            ...searchBookmarks(searchQuery, item as BookmarkFolder),
          ];
        }
      }
      
      return results;
    };
    
    const results = searchBookmarks(query, folder);
    setSearchResults(results);
  };

  // 当搜索词或当前文件夹变化时执行搜索
  useEffect(() => {
    performSearch(searchTerm, currentFolder);
  }, [searchTerm, currentFolder]);

  useEffect(() => {
    chrome.storage.sync.get({ viewMode: "grid" }, (result) => {
      setViewMode(result.viewMode);
    });
  }, []);

  const handleViewChange = (view: "grid" | "list") => {
    setViewMode(view);
    chrome.storage.sync.set({ viewMode: view });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 只在左键点击时激活拖拽功能，右键点击时不触发拖拽
      activationConstraint: {
        distance: 3,
        tolerance: 8,
        // 注意：mouseButtons 不是标准属性，我们使用其他方式处理右键点击
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  };

  // 加载书签数据并设置事件监听器
  useEffect(() => {
    // 初始加载书签数据
    const loadBookmarks = (isInitialLoad = false) => {
      chrome.bookmarks.getTree((bookmarkArray) => {
        const rootNode = bookmarkArray[0].children?.[0] as ChromeBookmarkTreeNode;
        if (rootNode) {
          const convertedFolder = convertToBookmark(rootNode) as BookmarkFolder;
          
          // 如果是初始加载，直接设置当前文件夹
          if (isInitialLoad) {
            setCurrentFolder(convertedFolder);
          } else {
            // 如果不是初始加载，需要保持当前导航状态
            
            // 如果在搜索模式下
            if (searchTerm) {
              // 只更新根文件夹的内容，但保持当前视图
              setCurrentFolder(prev => ({
                ...prev,
                children: convertedFolder.children
              }));
            } else {
              // 如果在文件夹导航模式下，需要保持当前文件夹位置
              // 获取当前文件夹的 ID
              const currentFolderId = currentFolder.id;
              
              // 如果当前不在根文件夹
              if (currentFolderId !== convertedFolder.id) {
                // 递归查找当前文件夹
                const findFolder = (folder: BookmarkFolder, id: string): BookmarkFolder | null => {
                  if (folder.id === id) {
                    return folder;
                  }
                  
                  for (const child of folder.children) {
                    if (!("url" in child) && child.children) {
                      const found = findFolder(child as BookmarkFolder, id);
                      if (found) {
                        return found;
                      }
                    }
                  }
                  
                  return null;
                };
                
                const updatedCurrentFolder = findFolder(convertedFolder, currentFolderId);
                
                // 如果找到了当前文件夹，更新它
                if (updatedCurrentFolder) {
                  setCurrentFolder(updatedCurrentFolder);
                } else {
                  // 如果找不到当前文件夹（可能已被删除），回到上一级
                  if (folderHistory.length > 0) {
                    const previousFolder = folderHistory[folderHistory.length - 1];
                    setCurrentFolder(previousFolder);
                    setFolderHistory(folderHistory.slice(0, -1));
                  } else {
                    // 如果没有历史记录，回到根文件夹
                    setCurrentFolder(convertedFolder);
                  }
                }
              } else {
                // 如果在根文件夹，直接更新
                setCurrentFolder(convertedFolder);
              }
            }
          }
          
          // 如果有搜索词，重新执行搜索
          if (searchTerm) {
            performSearch(searchTerm, convertedFolder);
          }
        }
      });
    };
    
    // 初始加载
    loadBookmarks(true);
    
    
    // 监听 Chrome bookmarks API 的事件
    const handleBookmarkChanged = (id: string, changeInfo: any) => {
      console.log(`Bookmark ${id} changed, updating data...`);
      
      // 只在搜索模式下更新搜索结果
      if (searchTerm && searchResults.length > 0) {
        // 如果是当前搜索结果中的项目被修改，更新搜索结果
        setSearchResults(prev => {
          // 移除被修改的项目
          const filtered = prev.filter(item => item.id !== id);
          // 重新执行搜索，确保结果是最新的
          setTimeout(() => performSearch(searchTerm, currentFolder), 0);
          return filtered;
        });
      }
    };
    
    const handleBookmarkRemoved = (id: string, removeInfo: any) => {
      console.log(`Bookmark ${id} removed`);
      
      // 检查是否是我们手动删除的书签（避免重复处理）
      const isRecentlyDeleted = recentlyDeletedRef.current.some(item => item.id === id);
      if (isRecentlyDeleted) {
        // 如果是手动删除的，不需要事件监听器再处理
        console.log(`Bookmark ${id} was manually deleted, skipping event handler`);
        return;
      }
      
      // 只在搜索模式下更新搜索结果
      if (searchTerm && searchResults.length > 0) {
        // 如果是当前搜索结果中的项目被删除，从搜索结果中移除它
        setSearchResults(prev => prev.filter(item => item.id !== id));
      }
    };
    
    const handleBookmarkCreatedOrMoved = () => {
      console.log('Bookmark created or moved');
      
      // 只在搜索模式下重新执行搜索
      if (searchTerm) {
        // 延迟加载书签，确保 Chrome API 操作完成
        setTimeout(() => {
          chrome.bookmarks.getTree((bookmarkArray) => {
            const rootNode = bookmarkArray[0].children?.[0] as ChromeBookmarkTreeNode;
            if (rootNode) {
              const convertedFolder = convertToBookmark(rootNode) as BookmarkFolder;
              performSearch(searchTerm, convertedFolder);
            }
          });
        }, 100);
      }
    };
    
    // 添加事件监听器
    chrome.bookmarks.onChanged.addListener(handleBookmarkChanged);
    chrome.bookmarks.onRemoved.addListener(handleBookmarkRemoved);
    chrome.bookmarks.onCreated.addListener(handleBookmarkCreatedOrMoved);
    chrome.bookmarks.onMoved.addListener(handleBookmarkCreatedOrMoved);
    
    // 组件卸载时移除事件监听器
    return () => {
      chrome.bookmarks.onChanged.removeListener(handleBookmarkChanged);
      chrome.bookmarks.onRemoved.removeListener(handleBookmarkRemoved);
      chrome.bookmarks.onCreated.removeListener(handleBookmarkCreatedOrMoved);
      chrome.bookmarks.onMoved.removeListener(handleBookmarkCreatedOrMoved);
    };
  }, [searchTerm]); // 依赖 searchTerm 确保搜索词变化时重新执行


  const handleFolderClick = (folder: BookmarkFolder) => {
    setFolderHistory([...folderHistory, currentFolder]);
    setCurrentFolder(folder);
  };

  const handleBack = () => {
    if (folderHistory.length > 0) {
      const previousFolder = folderHistory[folderHistory.length - 1];
      setFolderHistory(folderHistory.slice(0, -1));
      setCurrentFolder(previousFolder);
    }
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    chrome.bookmarks.update(id, { title: newTitle }, () => {
      setCurrentFolder((prev) => ({
        ...prev,
        title: id === prev.id ? newTitle : prev.title,
        children: prev.children.map((child) =>
          child.id === id ? { ...child, title: newTitle } : child
        ),
      }));
    });
    setEditModalOpen(false);
  };

  const handleUpdateBookmark = (id: string, newTitle: string) => {
    chrome.bookmarks.update(id, { title: newTitle }, () => {
      // 使用函数式更新确保状态正确更新
      setCurrentFolder(prev => {
        const updatedFolder = {
          ...prev,
          children: prev.children.map(child =>
            child.id === id ? { ...child, title: newTitle } : child
          ),
        };
        // 强制触发重新渲染
        return updatedFolder;
      });

      // 更新搜索结果中的书签标题
      if (searchResults.length > 0) {
        setSearchResults(prev => {
          const updatedResults = prev.map(item =>
            item.id === id ? { ...item, title: newTitle } : item
          );
          // 强制触发重新渲染
          return [...updatedResults];
        });
      }
      
      // 强制触发重新渲染
      setTimeout(() => {
        setCurrentFolder(prev => ({...prev}));
      }, 0);
    });
  };

  const handleDeleteBookmark = (id: string) => {
    // 保存当前文件夹 ID，用于后续恢复状态
    const currentFolderId = currentFolder.id;
    
    // 将要删除的书签添加到最近删除列表中，以避免事件监听器重复处理
    recentlyDeletedRef.current = [
      ...recentlyDeletedRef.current,
      { id, timestamp: Date.now() }
    ];
    
    // 清理超过 5 秒的记录
    const now = Date.now();
    recentlyDeletedRef.current = recentlyDeletedRef.current.filter(
      (item: {id: string, timestamp: number}) => now - item.timestamp < 5000
    );
    
    // 从当前文件夹的子项中移除被删除的书签（立即更新 UI）
    setCurrentFolder(prev => ({
      ...prev,
      children: prev.children.filter(child => child.id !== id)
    }));
    
    // 如果在搜索模式下，从搜索结果中移除被删除的项目
    if (searchResults.length > 0) {
      setSearchResults(prev => prev.filter(item => item.id !== id));
    }
    
    // 然后调用 Chrome API 删除书签
    chrome.bookmarks.remove(id, () => {
      console.log(`Bookmark ${id} deleted successfully`);
      
      // 手动更新当前文件夹，而不依赖事件监听器
      // 这样可以确保保持在当前文件夹视图中
      chrome.bookmarks.getSubTree(currentFolderId, (results) => {
        if (results && results.length > 0) {
          const updatedFolder = convertToBookmark(results[0]) as BookmarkFolder;
          setCurrentFolder(updatedFolder);
        }
      });
    });
  };

  const handleUpdateFolder = (id: string, newTitle: string) => {
    chrome.bookmarks.update(id, { title: newTitle }, () => {
      // 更新当前文件夹
      if (id === currentFolder.id) {
        setCurrentFolder(prev => ({
          ...prev,
          title: newTitle,
        }));
      }

      // 更新当前文件夹的子文件夹
      setCurrentFolder(prev => {
        const updatedFolder = {
          ...prev,
          children: prev.children.map(child =>
            child.id === id ? { ...child, title: newTitle } : child
          ),
        };
        return updatedFolder;
      });

      // 更新文件夹历史
      setFolderHistory(prev => {
        const updatedHistory = prev.map(folder =>
          folder.id === id ? { ...folder, title: newTitle } : folder
        );
        return [...updatedHistory];
      });

      // 更新搜索结果中的文件夹
      if (searchResults.length > 0) {
        setSearchResults(prev => {
          const updatedResults = prev.map(item =>
            item.id === id ? { ...item, title: newTitle } : item
          );
          return [...updatedResults];
        });
      }
      
      // 强制触发重新渲染
      setTimeout(() => {
        setCurrentFolder(prev => ({...prev}));
      }, 0);
    });
  };

  const handleDeleteFolder = (id: string) => {
    chrome.bookmarks.removeTree(id, () => {
      // 从当前文件夹中移除文件夹
      setCurrentFolder(prev => {
        const updatedFolder = {
          ...prev,
          children: prev.children.filter(child => child.id !== id),
        };
        return updatedFolder;
      });

      // 从搜索结果中移除文件夹
      if (searchResults.length > 0) {
        setSearchResults(prev => {
          const updatedResults = prev.filter(item => item.id !== id);
          return [...updatedResults];
        });
      }

      // 如果删除的是历史记录中的文件夹，需要更新历史记录
      const folderIndex = folderHistory.findIndex(folder => folder.id === id);
      if (folderIndex !== -1) {
        setFolderHistory(prev => {
          const updatedHistory = prev.filter(folder => folder.id !== id);
          return [...updatedHistory];
        });
      }
      
      // 强制触发重新渲染
      setTimeout(() => {
        setCurrentFolder(prev => ({...prev}));
      }, 0);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const oldIndex = currentFolder.children.findIndex(
      (item) => item.id === activeId
    );
    const newIndex = currentFolder.children.findIndex(
      (item) => item.id === overId
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const activeItem = currentFolder.children[oldIndex];
    const overItem = currentFolder.children[newIndex];

    if (!activeItem || !overItem) return;

    const isSameType =
      ("url" in activeItem && "url" in overItem) ||
      (!("url" in activeItem) && !("url" in overItem));

    if (isSameType) {
      chrome.bookmarks.move(activeId, { index: newIndex }, () => {
        setCurrentFolder((prev) => ({
          ...prev,
          children: arrayMove(prev.children, oldIndex, newIndex),
        }));
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.searchBarContainer}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索书签..."
                className={styles.searchInput}
              />
              <div className={styles.searchIcon}>
                <svg
                  className={styles.searchIconSvg}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className={styles.clearButton}
                >
                  <svg
                    className={styles.clearButtonSvg}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className={styles.header}>
            <div className={styles.navigation}>
              {folderHistory.length > 0 && (
                <button onClick={handleBack} className={styles.backButton}>
                  <svg
                    className={styles.backIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <div className={styles.breadcrumb}>
                {folderHistory.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <button
                      onClick={() => {
                        setCurrentFolder(folder);
                        setFolderHistory((prev) => prev.slice(0, index));
                      }}
                      className={styles.breadcrumbItem}
                    >
                      {folder.title}
                    </button>
                    <span className={styles.breadcrumbSeparator}>/</span>
                  </React.Fragment>
                ))}
                <h1 className={styles.currentFolder}>{currentFolder.title}</h1>
              </div>
            </div>
            <ViewToggle view={viewMode} onViewChange={handleViewChange} />
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always,
              },
            }}
          >
            <div
              className={
                viewMode === "grid"
                  ? styles.gridContainer
                  : styles.listContainer
              }
            >
              <SortableContext
                items={(searchResults.length > 0
                  ? searchResults
                  : currentFolder.children
                ).map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                {(searchResults.length > 0
                  ? searchResults
                  : currentFolder.children
                ).map((item) => (
                  <SortableItem key={item.id} id={item.id}>
                    {"url" in item ? (
                      <Link
                        data={item as Bookmark}
                        viewMode={viewMode}
                        onUpdateBookmark={handleUpdateBookmark}
                        onDeleteBookmark={handleDeleteBookmark}
                      />
                    ) : (
                      <Folder
                        folder={item as BookmarkFolder}
                        onFolderClick={() =>
                          handleFolderClick(item as BookmarkFolder)
                        }
                        viewMode={viewMode}
                        onUpdateFolder={handleUpdateFolder}
                        onDeleteFolder={handleDeleteFolder}
                      />
                    )}
                  </SortableItem>
                ))}
              </SortableContext>

              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  找到 {searchResults.length} 个结果
                </div>
              )}

              {searchResults.length === 0 &&
                currentFolder.children.length === 0 && (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyStateText}>当前文件夹为空</p>
                  </div>
                )}
            </div>
            <DragOverlay>
              {activeId ? (
                <div className={styles.dragOverlay}>
                  {(() => {
                    const item = [
                      ...currentFolder.children,
                      ...searchResults,
                    ].find((item) => item.id === activeId);
                    if (!item) return null;
                    return "url" in item ? (
                      <Link data={item as Bookmark} viewMode={viewMode} />
                    ) : (
                      <Folder
                        folder={item as BookmarkFolder}
                        viewMode={viewMode}
                      />
                    );
                  })()}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={(title) => handleTitleChange(currentFolder.id, title)}
        title={currentFolder.title}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Newtab />
  </React.StrictMode>
);
