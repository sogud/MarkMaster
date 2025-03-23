import React from "react";
import { BookmarkFolder } from "../types";
import { FolderIcon } from "./icons/FolderIcon";
import styles from "./Folder.module.css";

interface FolderProps {
  folder: BookmarkFolder;
  onFolderClick?: (folderId: string) => void;
  level?: number;
  viewMode?: "grid" | "list";
}

const Folder: React.FC<FolderProps> = ({
  folder,
  onFolderClick,
  viewMode = "grid",
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFolderClick?.(folder.id);
  };

  return (
    <div className={viewMode === "grid" ? styles.containerGrid : styles.container}>
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
    </div>
  );
};

export default Folder;
