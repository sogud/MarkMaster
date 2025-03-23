import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  MeasuringStrategy,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { getFaviconFromCache } from '../utils/utils';
import { BookmarkFolder, Bookmark, convertToBookmark, ChromeBookmarkTreeNode } from '../types';
import Folder from '../components/Folder';
import Button from '../components/Button';
import SortableItem from '../components/SortableItem';
import SearchBar from '../components/SearchBar';
import ViewToggle from '../components/ViewToggle';

import Link from '../components/Link';

const EditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  title: string;
}> = ({ isOpen, onClose, onSave, title }) => {
  const [inputTitle, setInputTitle] = useState(title);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">编辑书签</h2>
        <input
          type="text"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={() => onSave(inputTitle)}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
};

function Newtab() {
  const [currentFolder, setCurrentFolder] = useState<BookmarkFolder>({
    id: '',
    title: '',
    children: [],
    dateAdded: 0,
    dateGroupModified: 0,
    index: 0
  });

  const [folderHistory, setFolderHistory] = useState<BookmarkFolder[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<(Bookmark | BookmarkFolder)[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    chrome.storage.sync.get({ viewMode: 'grid' }, (result) => {
      setViewMode(result.viewMode);
    });
  }, []);

  const handleViewChange = (view: 'grid' | 'list') => {
    setViewMode(view);
    chrome.storage.sync.set({ viewMode: view });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 0,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = () => {
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
      setCurrentFolder(prev => ({
        ...prev,
        title: id === prev.id ? newTitle : prev.title,
        children: prev.children.map(child => 
          child.id === id ? { ...child, title: newTitle } : child
        )
      }));
    });
    setEditModalOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }
    
    const activeId = String(active.id);
    const overId = String(over.id);
    
    const oldIndex = currentFolder.children.findIndex(item => item.id === activeId);
    const newIndex = currentFolder.children.findIndex(item => item.id === overId);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const activeItem = currentFolder.children[oldIndex];
      const overItem = currentFolder.children[newIndex];
      
      if (activeItem && overItem) {
        const isSameType = 
          ('url' in activeItem && 'url' in overItem) || 
          (!('url' in activeItem) && !('url' in overItem));

        if (isSameType) {
          chrome.bookmarks.move(activeId, { index: newIndex }, () => {
            setCurrentFolder(prev => ({
              ...prev,
              children: arrayMove(prev.children, oldIndex, newIndex)
            }));
          });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 
                      transition-all duration-300 hover:shadow-lg">
          <SearchBar
            currentFolder={currentFolder}
            onSearchResult={setSearchResults}
          />
          
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center space-x-6">
              {folderHistory.length > 0 && (
                <button
                  onClick={handleBack}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                          rounded-full transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="flex items-center space-x-2">
                {folderHistory.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <button 
                      onClick={() => {
                        setCurrentFolder(folder);
                        setFolderHistory(prev => prev.slice(0, index));
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {folder.title}
                    </button>
                    <span className="text-gray-400">/</span>
                  </React.Fragment>
                ))}
                <h1 className="text-lg font-medium text-gray-900">
                  {currentFolder.title}
                </h1>
              </div>
            </div>
            <ViewToggle view={viewMode} onViewChange={handleViewChange} />
          </div>

          <DndContext 
            sensors={sensors} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            autoScroll={{
              enabled: true,
              threshold: { x: 0, y: 0.2 }
            }}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always
              }
            }}
          >
            <div 
              className={`
                transition-all duration-300 ease-in-out
                ${viewMode === 'grid' 
                  ? 'flex flex-wrap -mx-2' 
                  : 'flex flex-col divide-y divide-gray-100'
                }
              `}
              style={{
                minHeight: currentFolder.children.length === 0 ? 'auto' : '200px'
              }}
            >
              <SortableContext 
                items={(searchResults.length > 0 ? searchResults : currentFolder.children)
                  .map(item => item.id)}
              >
                {(searchResults.length > 0 ? searchResults : currentFolder.children).map((item) => (
                  <SortableItem key={item.id} id={item.id}>
                    {'url' in item ? (
                      <Link data={item as Bookmark} viewMode={viewMode} />
                    ) : (
                      <Folder
                        folder={item as BookmarkFolder}
                        onFolderClick={() => handleFolderClick(item as BookmarkFolder)}
                        viewMode={viewMode}
                      />
                    )}
                  </SortableItem>
                ))}
              </SortableContext>
              
              {searchResults.length > 0 && (
                <div className="w-full text-center py-4 text-sm text-gray-500">
                  找到 {searchResults.length} 个结果
                </div>
              )}
              
              {searchResults.length === 0 && currentFolder.children.length === 0 && (
                <div className="w-full text-center py-12">
                  <p className="text-gray-500">当前文件夹为空</p>
                </div>
              )}
            </div>
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

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Newtab />
  </React.StrictMode>
);
