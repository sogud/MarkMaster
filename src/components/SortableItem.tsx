import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        relative
        ${
          isDragging
            ? "cursor-grabbing z-50 shadow-lg scale-105"
            : "cursor-grab hover:scale-[1.02]"
        }
        touch-none select-none
        transition-all duration-200 ease-in-out
        rounded-lg
      `}
    >
      {children}
    </div>
  );
};

export default SortableItem;
