import React, { useState } from 'react';
import { BookmarkFolder } from '../types';

interface FolderProps {
  folder: BookmarkFolder;
  onFolderClick?: (folderId: string) => void;
  level?: number;
  viewMode?: 'grid' | 'list';
}

const Folder: React.FC<FolderProps> = ({ 
  folder, 
  onFolderClick,
  level = 0,
  viewMode = 'grid'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    onFolderClick?.(folder.id);
  };

  return (
    <div className={viewMode === 'grid'
      ? "w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
      : "w-full p-1"
    }>
      <div
        className={`
          group block bg-white hover:bg-gray-50 rounded-xl shadow-sm 
          border border-gray-200 hover:border-gray-300 
          transition-all duration-200 cursor-pointer select-none
          ${viewMode === 'grid' 
            ? 'p-4 h-full transform hover:-translate-y-1 flex flex-col items-center justify-center text-center' 
            : 'p-3 hover:translate-x-1'
          }
          ${level > 0 ? 'ml-4' : ''}
        `}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        title={folder.title}
      >
        {viewMode === 'grid' ? (
          <>
            <div className="relative mb-2">
              <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="absolute bottom-0 right-0 text-gray-400 group-hover:text-gray-600 transition-colors">
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </span>
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
            <div className="flex-shrink-0 flex items-center space-x-2">
              <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </span>
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
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
      
      <div
        className={`
          ${viewMode === 'grid'
            ? 'mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'mt-2 flex flex-col space-y-1 ml-6'
          }
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}
        `}
      >
        {isExpanded && folder.children.map((child) => {
          if ('url' in child) {
            return (
              <a
                key={child.id}
                href={child.url}
                className="block p-4 bg-white hover:bg-gray-50 rounded-xl shadow-sm 
                         border border-gray-200 hover:border-gray-300 
                         transition-all duration-200 transform hover:-translate-y-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {child.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {child.url && new URL(child.url).hostname.replace('www.', '')}
                    </p>
                  </div>
                </div>
              </a>
            );
          } else {
            return (
              <Folder
                key={child.id}
                folder={child}
                onFolderClick={onFolderClick}
                level={level + 1}
                viewMode={viewMode}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default Folder;
