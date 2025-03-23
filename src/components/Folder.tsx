import React from "react";
import { BookmarkFolder } from "../types";
import { FolderIcon } from "./icons/FolderIcon";

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
    <div
      className={
        viewMode === "grid"
          ? "w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
          : "w-full p-1"
      }
    >
      <div
        className={`
          group bg-white hover:bg-gray-50 rounded-xl shadow-sm 
          border border-gray-200 hover:border-gray-300 
          transition-all duration-200
          ${
            viewMode === "grid"
              ? "p-4 h-full transform hover:-translate-y-1 flex flex-col items-center justify-center text-center max-w-[200px]"
              : "p-3 hover:translate-x-1"
          }
        `}
        onClick={handleClick}
      >
        {viewMode === "grid" ? (
          <>
            <div className="relative mb-2">
              <FolderIcon className="w-12 h-12 text-yellow-500" />
            </div>
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 max-w-[120px]">
              {folder.title}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {folder.children?.length || 0} 个项目
            </p>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FolderIcon className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                {folder.title}
              </p>
              <p className="text-xs text-gray-500 truncate">
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
