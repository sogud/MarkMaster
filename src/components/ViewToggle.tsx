import React from 'react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-lg transition-colors duration-200
          ${view === 'grid' 
            ? 'text-blue-600 bg-blue-50' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        title="网格视图"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-lg transition-colors duration-200
          ${view === 'list' 
            ? 'text-blue-600 bg-blue-50' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        title="列表视图"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
};

export default ViewToggle;
