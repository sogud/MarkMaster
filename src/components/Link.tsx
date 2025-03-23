import React, { useEffect, useState } from "react";
import { Bookmark } from "../types";

interface LinkProps {
  data: Bookmark;
  viewMode: "grid" | "list";
}

const Link: React.FC<LinkProps> = ({ data, viewMode }) => {
  const [faviconUrl, setFaviconUrl] = useState("");

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

  return (
    <div
      className={
        viewMode === "grid"
          ? "w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
          : "w-full p-1"
      }
    >
      <div
        className={`group bg-white hover:bg-gray-50 rounded-xl shadow-sm 
                  border border-gray-200 hover:border-gray-300 
                  transition-all duration-200
                  ${
                    viewMode === "grid"
                      ? "p-4 h-full transform hover:-translate-y-1"
                      : "p-3 hover:translate-x-1"
                  }`}
      >
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block ${
            viewMode === "grid"
              ? "flex flex-col items-center justify-center text-center"
              : ""
          }`}
          title={data.title}
          onClick={handleClick}
        >
          {viewMode === "grid" ? (
            <>
              <img
                className="w-12 h-12 rounded-lg mb-2"
                src={
                  faviconUrl ||
                  `https://www.google.com/s2/favicons?domain=${data.url}&sz=128`
                }
                alt=""
                draggable={false}
              />
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 max-w-[120px]">
                {data.title.length > 7
                  ? `${data.title.slice(0, 7)}...`
                  : data.title}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[120px]">
                {new URL(data.url).hostname.replace("www.", "")}
              </p>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img
                  className="w-8 h-8 rounded-lg"
                  src={
                    faviconUrl ||
                    `https://www.google.com/s2/favicons?domain=${data.url}&sz=128`
                  }
                  alt=""
                  draggable={false}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                  {data.title.length > 20
                    ? `${data.title.slice(0, 20)}...`
                    : data.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {new URL(data.url).hostname.replace("www.", "")}
                </p>
              </div>
            </div>
          )}
        </a>
      </div>
    </div>
  );
};

export default Link;
