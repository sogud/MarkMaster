import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Typography } from 'antd';
const { Paragraph } = Typography;
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
    fill="currentColor"
    className="w-10 h-10"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    {...props}>
    <path d="M0 4c0-1.1.9-2 2-2h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z"></path>
  </svg>
);
const BackIcon = (props: any) => (
  <svg
    t="1679235244818"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="4545"
    className="w-10 h-10"
    {...props}>
    <path
      d="M471.893333 149.333333a42.666667 42.666667 0 0 0-73.258666-29.781333l-343.893334 352.981333a42.666667 42.666667 0 0 0-0.768 58.709334l343.893334 372.352a42.666667 42.666667 0 0 0 73.984-28.928v-190.677334c56.917333-5.248 116.821333-1.365333 179.882666 11.989334 65.834667 13.994667 150.528 76.032 253.909334 202.24a42.666667 42.666667 0 0 0 75.477333-31.36c-15.445333-152.32-73.984-281.301333-176.170667-384.853334-92.757333-93.994667-204.373333-146.432-333.098666-156.586666V149.333333z"
      fill="#000000"
      fill-opacity=".85"
      p-id="4546"></path>
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
      className="sm:w-1/4 md:w-1/6 lg:w-1/12 p-2 flex flex-col justify-items-center 
                  items-center cursor-pointer fill-current
                  text-blue-500 rounded-lg
                  hover:bg-opacity-50
                  ">
      <img
        className="w-10 h-10 rounded-lg"
        src={faviconUrl}
        alt=""
      />
      <Paragraph
        ellipsis={{
          rows: 2,
          suffix: ''
        }}>
        {data.title}
      </Paragraph>
    </a>
  );
};
const Folder: React.FC<{ data: BookmarkItem; onClick: any }> = (props) => {
  const { data, onClick } = props;

  return (
    <>
      <div
        onClick={onClick}
        className="sm:w-1/4 md:w-1/6 lg:w-1/12  p-2 flex flex-col justify-items-center 
                   items-center cursor-pointer fill-current
                   text-blue-500 rounded-lg
                   hover:bg-opacity-20
                   hover:bg-white
                   ">
        <FolderIcon />
        <Paragraph
          className="text-center"
          style={{
            marginBottom: 0
          }}
          ellipsis={{
            rows: 2,
            suffix: ''
          }}>
          {data.title}
        </Paragraph>
      </div>
    </>
  );
};

function Newtab() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [ohterBookmarks, setOhterBookmarks] = useState<BookmarkItem[]>([]);
  const [mobileBookmarks, setMobileBookmarks] = useState<BookmarkItem[]>([]);

  const [currentData, setCurrentData] = useState<BookmarkItem>({
    dateAdded: 0,
    dateGroupModified: 0,
    id: '',
    index: 0,
    parentId: '',
    title: '',
    children: []
  });

  const [prevData, setPrevData] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    chrome.bookmarks.getTree(function (bookmarkArray: any) {
      const data = bookmarkArray[0].children?.[0];
      setBookmarks(bookmarkArray[0].children?.[0]?.children);
      setCurrentData(data);

      console.log(bookmarkArray);
    });
  }, []);

  const handleFolderClick = (folder: BookmarkItem) => {
    if (folder.children) {
      setPrevData([...prevData, currentData]);
      setCurrentData(folder);
    }
  };

  const handleBackClick = () => {
    const lastData = prevData.pop();
    if (lastData) {
      setCurrentData(lastData);
    }
  };

  return (
    <div className="mx-auto pt-20">
      <div
        className="container mx-auto 
                   p-8 rounded-lg bg-opacity-50
                   bg-white ">
        <div className="flex justify-center items-center mb-8 text-blue-500">
          {prevData.length > 0 && (
            <>
              <BackIcon
                onClick={handleBackClick}
                className="w-5 h-5 ml-4 fill-current
                 cursor-pointer
                "
                style={{
                  marginRight: 'auto'
                }}
              />
              <Typography.Title
                editable
                level={2}
                style={{ margin: 0, marginRight: 'auto' }}>
                {currentData.title}
              </Typography.Title>
            </>
          )}
        </div>

        <div className="flex flex-wrap">
          {currentData.children
            ?.filter?.((item) => !item.url)
            .map((bookmark) => {
              return (
                <Folder
                  data={bookmark}
                  key={bookmark.id}
                  onClick={() => handleFolderClick(bookmark)}></Folder>
              );
            })}
          {currentData.children
            ?.filter?.((item) => item.url)
            .map((bookmark) => {
              return (
                <Link
                  data={bookmark}
                  key={bookmark.id}></Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <main
      className="w-full h-full min-h-screen
      bg-gradient-to-r from-green-400 to-blue-500">
      <Newtab />
    </main>
  </React.StrictMode>,
  document.getElementById('root')
);
