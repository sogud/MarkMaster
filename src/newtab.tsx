import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Typography, Modal, Input, Popover } from 'antd';
import { getFaviconFromCache } from './utils';

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

const EditModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onOk: (title: string) => void;
  title: string;
}> = (props) => {
  const { visible, onCancel, onOk, title } = props;
  const [inputTitle, setInputTitle] = useState(title);

  return (
    <Modal
      title="Edit Bookmark"
      open={visible}
      onOk={() => onOk(inputTitle)}
      onCancel={onCancel}>
      <Input
        value={inputTitle}
        onChange={(e) => setInputTitle(e.target.value)}
      />
    </Modal>
  );
};

const Popup: React.FC<any> = ({ x, y, open, onClose = () => {} }) => {
  const ref = useRef<any>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const popup = ref.current;
      if (popup && !popup.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        display: open ? 'block' : 'none',
        position: 'absolute',
        top: y,
        left: x,
        width: 400,
        height: 400,
        backgroundColor: 'white',
        border: '1px solid black',
        borderRadius: 5,
        zIndex: 9999
      }}
      className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <span className="ml-2 text-2xl font-bold">Bookmarks</span>
        </div>
        <Button
          type="primary"
          onClick={() => {}}>
          New Folder
        </Button>
      </div>
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
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="4545"
    className="w-10 h-10"
    {...props}>
    <path
      d="M471.893333 149.333333a42.666667 42.666667 0 0 0-73.258666-29.781333l-343.893334 352.981333a42.666667 42.666667 0 0 0-0.768 58.709334l343.893334 372.352a42.666667 42.666667 0 0 0 73.984-28.928v-190.677334c56.917333-5.248 116.821333-1.365333 179.882666 11.989334 65.834667 13.994667 150.528 76.032 253.909334 202.24a42.666667 42.666667 0 0 0 75.477333-31.36c-15.445333-152.32-73.984-281.301333-176.170667-384.853334-92.757333-93.994667-204.373333-146.432-333.098666-156.586666V149.333333z"
      fill="#000000"
      fillOpacity=".85"
      p-id="4546"></path>
  </svg>
);
const EditIcon = (props: any) => (
  <svg
    {...props}
    viewBox="0 0 1028 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="6182"
    width="200"
    height="200">
    <path
      d="M1018.319924 112.117535q4.093748 9.210934 6.652341 21.492179t2.558593 25.585928-5.117186 26.609365-16.374994 25.585928q-12.281245 12.281245-22.003898 21.492179t-16.886712 16.374994q-8.187497 8.187497-15.351557 14.32812l-191.382739-191.382739q12.281245-11.257808 29.167958-27.121083t28.144521-25.074209q14.32812-11.257808 29.679676-15.863275t30.191395-4.093748 28.656239 4.605467 24.050772 9.210934q21.492179 11.257808 47.589826 39.402329t40.425766 58.847634zM221.062416 611.554845q6.140623-6.140623 28.656239-29.167958t56.289041-56.80076l74.710909-74.710909 82.898406-82.898406 220.038979-220.038979 191.382739 192.406177-220.038979 220.038979-81.874969 82.898406q-40.937484 39.914047-73.687472 73.175753t-54.242167 54.753885-25.585928 24.562491q-10.234371 9.210934-23.539054 19.445305t-27.632802 16.374994q-14.32812 7.16406-41.960921 17.398431t-57.824197 19.957024-57.312478 16.886712-40.425766 9.210934q-27.632802 3.070311-36.843736-8.187497t-5.117186-37.867173q2.046874-14.32812 9.722653-41.449203t16.374994-56.289041 16.886712-53.730448 13.304682-33.773425q6.140623-14.32812 13.816401-26.097646t22.003898-26.097646z"
      p-id="6183"></path>
  </svg>
);

const Link: React.FC<{ data: BookmarkItem }> = (props) => {
  const { data } = props;

  const [faviconUrl, setFaviconUrl] = useState('');

  data.url &&
    getFaviconFromCache(data.url, (base64: any) => {
      setFaviconUrl(base64);
    });

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
        className="w-10 h-10 rounded-lg mb-1"
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
const Folder: React.FC<{
  data: BookmarkItem;
  onClick: any;
  onContextMenu: any;
}> = (props) => {
  const { data, onClick, onContextMenu } = props;

  return (
    <>
      <div
        onContextMenu={onContextMenu}
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

  const handleChangeTitle = (id: string, title: string) => {
    chrome.bookmarks.update(id, { title });
    const newCurrentData = { ...currentData, title };
    setCurrentData(newCurrentData);

    // update prevData
    const lastData = prevData.pop();
    if (lastData) {
      lastData.children = lastData.children?.map((item) => {
        if (item.id === id) {
          return newCurrentData;
        }
        return item;
      });
      setPrevData([...prevData, lastData]);
    }
  };

  const handleCreateBookmark = () => {
    chrome.bookmarks.create(
      {
        parentId: currentData.id,
        title: 'New Bookmark',
        url: 'https://www.google.com'
      },
      (newBookmark: any) => {
        const newCurrentData = {
          ...currentData,
          children: currentData.children
            ? [...currentData.children, newBookmark]
            : [newBookmark]
        };
        setCurrentData(newCurrentData);
      }
    );
  };

  const [editVisible, setEditVisible] = useState(false);
  const [XY, setXY] = useState({
    x: 0,
    y: 0
  });
  const [open, setOpen] = useState(false);
  return (
    <>
      <EditModal
        visible={editVisible}
        title={currentData.title}
        onCancel={() => setEditVisible(false)}
        onOk={() => setEditVisible(false)}
      />
      <Popup
        onClose={() => setOpen(false)}
        open={open}
        x={XY.x}
        y={XY.y}
      />
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
                  editable={{
                    icon: (
                      <EditIcon
                        className="w-5 h-5 fill-current
                                  cursor-pointer
                                "
                      />
                    ),
                    onChange: (value) => {
                      handleChangeTitle(currentData.id, value);
                    }
                  }}
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
                    onContextMenu={(e: any) => {
                      e.preventDefault();
                      setXY({
                        x: e.clientX,
                        y: e.clientY
                      });
                      setOpen(true);
                    }}
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
    </>
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
