import React, { useEffect, useState } from "react";
import { Bookmark } from "../types";
import styles from "./Link.module.css";
import ContextMenu from "./ContextMenu";

interface LinkProps {
  data: Bookmark;
  viewMode: "grid" | "list";
  onUpdateBookmark?: (id: string, newTitle: string) => void;
  onDeleteBookmark?: (id: string) => void;
}

const Link: React.FC<LinkProps> = ({ 
  data, 
  viewMode, 
  onUpdateBookmark, 
  onDeleteBookmark 
}) => {
  const [faviconUrl, setFaviconUrl] = useState("");
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(data.title);

  useEffect(() => {
    const getFavicon = async () => {
      try {
        const response = await fetch(
          `https://www.google.com/s2/favicons?domain=${data.url}&sz=128`
        );
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setFaviconUrl(reader.result as string);
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to fetch favicon:", error);
      }
    };
    getFavicon();
  }, [data.url]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    if (onDeleteBookmark) {
      onDeleteBookmark(data.id);
    }
    handleCloseContextMenu();
  };

  const handleSaveEdit = () => {
    if (onUpdateBookmark) {
      onUpdateBookmark(data.id, editTitle);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(data.title);
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
      <div className={viewMode === "grid" ? styles.cardGrid : styles.cardList}>
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className={viewMode === "grid" ? styles.linkGrid : styles.link}
          title={data.title}
          onClick={handleClick}
        >
          {viewMode === "grid" ? (
            <>
              <img
                className={styles.iconGrid}
                src={
                  faviconUrl ||
                  `https://www.google.com/s2/favicons?domain=${data.url}&sz=128`
                }
                alt=""
                draggable={false}
              />
              <p className={styles.titleGrid}>
                {data.title.length > 7
                  ? `${data.title.slice(0, 7)}...`
                  : data.title}
              </p>
              <p className={styles.urlGrid}>
                {new URL(data.url).hostname.replace("www.", "")}
              </p>
            </>
          ) : (
            <div className={styles.listContent}>
              <div className={styles.listIconWrapper}>
                <img
                  className={styles.icon}
                  src={
                    faviconUrl ||
                    `https://www.google.com/s2/favicons?domain=${data.url}&sz=128`
                  }
                  alt=""
                  draggable={false}
                />
              </div>
              <div className={styles.listTextWrapper}>
                <p className={styles.title}>
                  {data.title.length > 20
                    ? `${data.title.slice(0, 20)}...`
                    : data.title}
                </p>
                <p className={styles.url}>
                  {new URL(data.url).hostname.replace("www.", "")}
                </p>
              </div>
            </div>
          )}
        </a>
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

export default Link;
