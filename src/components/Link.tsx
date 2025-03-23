import React, { useEffect, useState } from "react";
import { Bookmark } from "../types";
import styles from "./Link.module.css";

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
    <div className={viewMode === "grid" ? styles.containerGrid : styles.container}>
      <div className={viewMode === "grid" ? styles.cardGrid : styles.cardList}>
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className={viewMode === "grid" ? styles.linkGrid : styles.link}
          title={data.title}
          onClick={handleClick}
        >
          {viewMode === "grid" ? (
            <>
              <img
                className={styles.iconGrid}
                src={
                  faviconUrl ||
                  `https://www.google.com/s2/favicons?domain=${data.url}&sz=128`
                }
                alt=""
                draggable={false}
              />
              <p className={styles.titleGrid}>
                {data.title.length > 7
                  ? `${data.title.slice(0, 7)}...`
                  : data.title}
              </p>
              <p className={styles.urlGrid}>
                {new URL(data.url).hostname.replace("www.", "")}
              </p>
            </>
          ) : (
            <div className={styles.listContent}>
              <div className={styles.listIconWrapper}>
                <img
                  className={styles.icon}
                  src={
                    faviconUrl ||
                    `https://www.google.com/s2/favicons?domain=${data.url}&sz=128`
                  }
                  alt=""
                  draggable={false}
                />
              </div>
              <div className={styles.listTextWrapper}>
                <p className={styles.title}>
                  {data.title.length > 20
                    ? `${data.title.slice(0, 20)}...`
                    : data.title}
                </p>
                <p className={styles.url}>
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
