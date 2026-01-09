import { ChevronsUpDown, CircleQuestionMark, SettingsIcon } from "lucide-react"

const EditorFooter = () => {
  return (
    <div className='bg-topbar border-t-[1px] border-[#e0e0e0] text-gray-500 w-full h-12 max-h-12 z-30 sticky top-0 bottom-0'>
        <div className='flex flex-row justify-between items-center gap-5 pl-14 text-sm pt-3'>
            <div className="flex flex-row items-center gap-1">
                <ChevronsUpDown size={18} className='inline-block'/>
                <span className="text-black text-[12px] select-none">Vault</span>
            </div>
            <div className="flex flex-row items-center gap-3 pr-4">
                <div className="flex flex-row items-center gap-2">
                    <CircleQuestionMark size={18} className='inline-block'/>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <SettingsIcon size={18} className='inline-block'/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default EditorFooter