import React from 'react'
import { BookmarkIcon, FileIcon, FolderIcon, RibbonIcon, SearchIcon, Sidebar } from 'lucide-react'

const EditorPinned = ({ isOpen, setIsOpen }) => {
  return (
    <div className='bg-offwhite border-b-[1px] border-[#e0e0e0] text-gray-500 w-full h-10 z-50 top-0 sticky'>
        <div className='flex flex-row justify-start items-center gap-5 pt-2.5 pl-14'>
            <FolderIcon size={20} className='inline-block'/>
            <SearchIcon size={20} className='inline-block'/>
            <BookmarkIcon size={20} className='inline-block' onClick={() => setIsOpen(!isOpen)}/>
        </div>
    </div>
  )
}

export default EditorPinned