import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Button from '../components/Button';
import { Options as OptionsType } from '../types';
import styles from './options.module.css';

const Options = () => {
  const [options, setOptions] = useState<OptionsType>({
    theme: 'light',
    sortBy: 'name',
    layout: 'grid'
  });
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    chrome.storage.sync.get(
      {
        theme: 'light',
        sortBy: 'name',
        layout: 'grid'
      },
      (items) => {
        setOptions(items as OptionsType);
      }
    );
  }, []);

  const saveOptions = () => {
    chrome.storage.sync.set(
      options,
      () => {
        setStatus('设置已保存');
        const id = setTimeout(() => {
          setStatus('');
        }, 1000);
        return () => clearTimeout(id);
      }
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>书签管理器设置</h1>
      
      <div className={styles.formGroup}>
        <div className={styles.formItem}>
          <label className={styles.label}>主题：</label>
          <select
            value={options.theme}
            onChange={(e) => setOptions({...options, theme: e.target.value as 'light' | 'dark'})}
            className={styles.select}
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>

        <div className={styles.formItem}>
          <label className={styles.label}>排序方式：</label>
          <select
            value={options.sortBy}
            onChange={(e) => setOptions({...options, sortBy: e.target.value as 'date' | 'name' | 'url'})}
            className={styles.select}
          >
            <option value="date">时间</option>
            <option value="name">名称</option>
            <option value="url">网址</option>
          </select>
        </div>

        <div className={styles.formItem}>
          <label className={styles.label}>显示方式：</label>
          <select
            value={options.layout}
            onChange={(e) => setOptions({...options, layout: e.target.value as 'grid' | 'list'})}
            className={styles.select}
          >
            <option value="grid">网格</option>
            <option value="list">列表</option>
          </select>
        </div>

        <div className={styles.footer}>
          <Button onClick={saveOptions} variant="primary">
            保存设置
          </Button>
          {status && (
            <span className={styles.status}>
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
