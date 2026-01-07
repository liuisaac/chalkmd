import React from 'react'

const EditorTab = ({ tab, isActive, onClick, onClose }) => {
  return (
    <div
      className={`flex min-w-0 h-full items-center py-2 border-r border-gray-700 cursor-pointer group ${
        isActive ? 'bg-red-500' : 'bg-blue-500'
      }`}
      onClick={onClick}
    >
      <span className="text-sm text-gray-200 truncate">
        {tab.file ? tab.file.split('/').pop().replace('.md', '') : 'New Tab'}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(tab.id);
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-200 ml-2"
      >
        ✕
      </button>
    </div>
  );
};

export default EditorTab