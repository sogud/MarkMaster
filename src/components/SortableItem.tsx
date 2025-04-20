import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./SortableItem.module.css";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 999 : 1,
    position: "relative",
    touchAction: "none",
    willChange: isDragging ? "transform" : undefined,
  } as const;

  // 自定义处理右键点击事件，防止拖拽监听器干扰右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    // 阻止事件冒泡到 SortableItem 的拖拽监听器
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${styles.container} ${isDragging ? styles.dragging : ''}`}
      onContextMenu={handleContextMenu}
    >
      {children}
    </div>
  );
};

export default SortableItem;
