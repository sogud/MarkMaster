import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Bookmark, BookmarkFolder } from "../types";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  currentFolder: BookmarkFolder;
  onSearchResult: (results: (Bookmark | BookmarkFolder)[]) => void;
}

export interface SearchBarRef {
  refreshSearch: () => void;
}

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(({
  currentFolder,
  onSearchResult,
}, ref) => {
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

  // 使用 useImperativeHandle 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    refreshSearch: () => {
      if (searchTerm) {
        const results = searchBookmarks(searchTerm, currentFolder);
        onSearchResult(results);
      }
    }
  }));

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索书签..."
          className={styles.input}
        />
        <div className={styles.searchIcon}>
          <svg
            className={styles.searchIconSvg}
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
            className={styles.clearButton}
          >
            <svg
              className={styles.clearButtonSvg}
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
        <div className={styles.searchingText}>
          正在搜索...
        </div>
      )}
    </div>
  );
});

export default SearchBar;
