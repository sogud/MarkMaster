import React, { useEffect, useState } from "react";
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
import SearchBar from "../components/SearchBar";
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
      activationConstraint: {
        distance: 3,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  };

  useEffect(() => {
    chrome.bookmarks.getTree((bookmarkArray) => {
      const rootNode = bookmarkArray[0].children?.[0] as ChromeBookmarkTreeNode;
      if (rootNode) {
        const convertedFolder = convertToBookmark(rootNode) as BookmarkFolder;
        setCurrentFolder(convertedFolder);
      }
    });
  }, []);

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
        <div className={styles.card}
        >
          <SearchBar
            currentFolder={currentFolder}
            onSearchResult={setSearchResults}
          />

            <div className={styles.header}>
              <div className={styles.navigation}>
              {folderHistory.length > 0 && (
                <button
                  onClick={handleBack}
                  className={styles.backButton}
                >
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
                <h1 className={styles.currentFolder}>
                  {currentFolder.title}
                </h1>
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
              className={viewMode === "grid" ? styles.gridContainer : styles.listContainer}
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
                      <Link data={item as Bookmark} viewMode={viewMode} />
                    ) : (
                      <Folder
                        folder={item as BookmarkFolder}
                        onFolderClick={() =>
                          handleFolderClick(item as BookmarkFolder)
                        }
                        viewMode={viewMode}
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
