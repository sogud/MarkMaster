import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Space } from 'antd';
type BookmarkItem = {
  dateAdded: number;
  dateGroupModified: number;
  id: string;
  index: number;
  parentId: string;
  title: string;
  url?: string;
  children?: BookmarkItem[];
};

const TreeItem: React.FC<{ data: BookmarkItem; layout?: string }> = (props) => {
  const { data } = props;

  return (
    <div className="pl-4 w-1/6">
      {data.url ? (
        <a
          className="block truncate break-words text-blue-600"
          href={data.url}
          target="_blank">
          {data.title}
        </a>
      ) : (
        <span className="w-44 truncate break-words">{data.title}</span>
      )}

      {data.children?.map?.((child) => {
        return (
          <TreeItem
            key={child.id}
            layout="vertical"
            data={child}
          />
        );
      })}
    </div>
  );
};

const FolderIcon = (props: any) => (
  <svg
    {...props}
    fill="currentColor"
    className="w-10 h-10"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20">
    <path d="M0 4c0-1.1.9-2 2-2h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z"></path>
  </svg>
);

const Link: React.FC<{ data: BookmarkItem }> = (props) => {
  const { data } = props;
  function getFavicon(url: string) {
    return `https://www.google.com/s2/favicons?sz=64&domain=${url}`;
  }
  function getFavicon2(url: string) {
    return `https://www.google.com/s2/favicons?sz=64&domain=${url}`;
  }
  // It depends on whether the user is accessing the website from China or not
  // If the user is accessing from China, use getFavicon2
  // Otherwise, use getFavicon
  const isFromChina = window.navigator.language.toLowerCase().includes('zh');
  const getFaviconMethod = isFromChina ? getFavicon2 : getFavicon;
  const faviconUrl = data.url && getFaviconMethod(data.url);
  return (
    <a
      href={data.url}
      target="_blank"
      className="w-20 flex flex-col justify-items-center 
                  items-center cursor-pointer fill-current
                  text-blue-500 rounded-lg
                  hover:bg-blue-200
                  ">
      <img
        className="w-10 h-10 rounded-lg"
        src={faviconUrl}
        alt=""
      />
      <span className="w-20 text-center truncate break-words block">
        {data.title}
      </span>
    </a>
  );
};
const Folder: React.FC<{ data: BookmarkItem; onClick: any }> = (props) => {
  const { data, onClick } = props;

  return (
    <>
      <div
        onClick={onClick}
        className="w-20 flex flex-col justify-items-center 
                   items-center cursor-pointer fill-current
                   text-blue-500 rounded-lg
                   hover:bg-blue-200
                   ">
        <FolderIcon />
        <span className="w-20 text-center truncate break-words">
          {data.title}
        </span>
      </div>
    </>
  );
};

function Newtab() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [ohterBookmarks, setOhterBookmarks] = useState<BookmarkItem[]>([]);
  const [mobileBookmarks, setMobileBookmarks] = useState<BookmarkItem[]>([]);

  const [currentData, setCurrentData] = useState<BookmarkItem[]>(bookmarks);

  const [prevData, setPrevData] = useState<BookmarkItem[][]>([]);

  useEffect(() => {
    chrome.bookmarks.getTree(function (bookmarkArray: any) {
      const data = bookmarkArray[0].children?.[0]?.children;
      setBookmarks(bookmarkArray[0].children?.[0]?.children);
      setCurrentData(data);

      console.log(bookmarkArray);
    });
  }, []);

  const handleFolderClick = (folder: BookmarkItem) => {
    if (folder.children) {
      setPrevData([...prevData, currentData]);
      setCurrentData(folder.children);
    }
  };

  const handleBackClick = () => {
    const lastData = prevData.pop();
    if (lastData) {
      setCurrentData(lastData);
    }
  };

  return (
    <div className="mx-auto">
      <Button
        type="text"
        onClick={handleBackClick}>
        返回
      </Button>

      <div className="flex flex-wrap container mx-auto p-10">
        {currentData
          .filter((item) => !item.url)
          ?.map?.((bookmark) => {
            return (
              <Folder
                data={bookmark}
                key={bookmark.id}
                onClick={() => handleFolderClick(bookmark)}></Folder>
            );
          })}
        {currentData
          .filter((item) => item.url)
          ?.map?.((bookmark) => {
            return (
              <Link
                data={bookmark}
                key={bookmark.id}></Link>
            );
          })}
      </div>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <main className="w-full h-full min-h-screen bg-blue-100">
      <Newtab />
    </main>
  </React.StrictMode>,
  document.getElementById('root')
);
