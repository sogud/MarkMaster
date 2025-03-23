import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Button from '../components/Button';
import { Options as OptionsType } from '../types';

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
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">书签管理器设置</h1>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <label className="w-24">主题：</label>
          <select
            value={options.theme}
            onChange={(e) => setOptions({...options, theme: e.target.value as 'light' | 'dark'})}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-24">排序方式：</label>
          <select
            value={options.sortBy}
            onChange={(e) => setOptions({...options, sortBy: e.target.value as 'date' | 'name' | 'url'})}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="date">时间</option>
            <option value="name">名称</option>
            <option value="url">网址</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-24">显示方式：</label>
          <select
            value={options.layout}
            onChange={(e) => setOptions({...options, layout: e.target.value as 'grid' | 'list'})}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="grid">网格</option>
            <option value="list">列表</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button onClick={saveOptions} variant="primary">
            保存设置
          </Button>
          {status && (
            <span className="text-green-600 animate-fade-out">
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
