import React, { useState } from "react";
import { BookmarkFolder } from "../types";
import { FolderIcon } from "./icons/FolderIcon";
import styles from "./Folder.module.css";
import ContextMenu from "./ContextMenu";

interface FolderProps {
  folder: BookmarkFolder;
  onFolderClick?: (folderId: string) => void;
  level?: number;
  viewMode?: "grid" | "list";
  onUpdateFolder?: (id: string, newTitle: string) => void;
  onDeleteFolder?: (id: string) => void;
}

const Folder: React.FC<FolderProps> = ({
  folder,
  onFolderClick,
  viewMode = "grid",
  onUpdateFolder,
  onDeleteFolder,
}) => {
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(folder.title);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFolderClick?.(folder.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // 阻止默认的浏览器右键菜单
    e.preventDefault();
    // 阻止事件冒泡到父元素
    e.stopPropagation();
    
    // 直接设置菜单状态，新的 ContextMenu 组件会处理其他逻辑
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({
      ...contextMenu,
      isOpen: false,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    handleCloseContextMenu();
  };

  const handleDelete = () => {
    if (onDeleteFolder) {
      onDeleteFolder(folder.id);
    }
    handleCloseContextMenu();
  };

  const handleSaveEdit = () => {
    if (onUpdateFolder) {
      onUpdateFolder(folder.id, editTitle);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(folder.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className={viewMode === "grid" ? styles.containerGrid : styles.container}>
        <div className={viewMode === "grid" ? styles.cardGrid : styles.cardList}>
          <div className={styles.editContainer}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className={styles.editInput}
            />
            <div className={styles.editButtons}>
              <button onClick={handleSaveEdit} className={styles.saveButton}>
                保存
              </button>
              <button onClick={handleCancelEdit} className={styles.cancelButton}>
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={viewMode === "grid" ? styles.containerGrid : styles.container}
      onContextMenu={handleContextMenu}
    >
      <div
        className={viewMode === "grid" ? styles.cardGrid : styles.cardList}
        onClick={handleClick}
      >
        {viewMode === "grid" ? (
          <>
            <div className={styles.iconWrapper}>
              <FolderIcon className={styles.iconGrid} />
            </div>
            <p className={styles.titleGrid}>
              {folder.title}
            </p>
            <p className={styles.count}>
              {folder.children?.length || 0} 个项目
            </p>
          </>
        ) : (
          <div className={styles.listContent}>
            <div className={styles.listIconWrapper}>
              <FolderIcon className={styles.icon} />
            </div>
            <div className={styles.listTextWrapper}>
              <p className={styles.title}>
                {folder.title}
              </p>
              <p className={styles.count}>
                {folder.children?.length || 0} 个项目
              </p>
            </div>
          </div>
        )}
      </div>
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isOpen={contextMenu.isOpen}
        onClose={handleCloseContextMenu}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Folder;
