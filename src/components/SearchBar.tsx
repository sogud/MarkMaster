import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkFolder } from "../types";

interface SearchBarProps {
  currentFolder: BookmarkFolder;
  onSearchResult: (results: (Bookmark | BookmarkFolder)[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  currentFolder,
  onSearchResult,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchBookmarks = (
    query: string,
    folder: BookmarkFolder
  ): (Bookmark | BookmarkFolder)[] => {
    let results: (Bookmark | BookmarkFolder)[] = [];

    for (const item of folder.children) {
      if (item.title.toLowerCase().includes(query.toLowerCase())) {
        results.push(item);
      }

      if (!("url" in item) && item.children) {
        results = [
          ...results,
          ...searchBookmarks(query, item as BookmarkFolder),
        ];
      }
    }

    return results;
  };

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const results = searchBookmarks(searchTerm, currentFolder);
      onSearchResult(results);
    } else {
      setIsSearching(false);
      onSearchResult([]);
    }
  }, [searchTerm, currentFolder]);

  return (
    <div className="relative mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索书签..."
          className="w-full px-4 py-2 pl-10 bg-white/60 backdrop-blur-sm
                   border border-gray-200 rounded-lg shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-400 text-sm"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg
            className="w-4 h-4"
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400
                     hover:text-gray-600 focus:outline-none"
          >
            <svg
              className="w-4 h-4"
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
      {isSearching && searchTerm && (
        <div className="absolute mt-1 w-full text-xs text-gray-500 pl-2">
          正在搜索...
        </div>
      )}
    </div>
  );
};

export default SearchBar;
