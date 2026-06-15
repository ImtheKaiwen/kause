import { motion } from 'framer-motion';

interface Props {
  onClick: () => void;
  formattedTime: string;
  isBreak: boolean;
}

export default function CompactView({ onClick, formattedTime, isBreak }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="w-full h-full flex items-center justify-between px-4 cursor-pointer hover:bg-white/5 transition-colors absolute inset-0"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 flex items-center justify-center">
          {isBreak ? (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-pure-white animate-pulse" />
          )}
        </div>
        <span className={`font-medium text-sm tabular-nums tracking-wide ${isBreak ? 'text-emerald-400' : 'text-pure-white'}`}>
          {formattedTime}
        </span>
      </div>
      
      {/* Wave animation and up arrow */}
      <div className="flex items-center h-full gap-2">
        <div className="flex gap-1 items-center h-full pt-1">
          <motion.div 
            animate={{ height: [4, 12, 4] }} 
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            className={`w-1 rounded-full ${isBreak ? 'bg-emerald-400/50' : 'bg-pure-white/50'}`} 
          />
          <motion.div 
            animate={{ height: [4, 16, 4] }} 
            transition={{ repeat: Infinity, duration: 1, delay: 0.2, ease: "easeInOut" }}
            className={`w-1 rounded-full ${isBreak ? 'bg-emerald-400/80' : 'bg-pure-white/80'}`} 
          />
          <motion.div 
            animate={{ height: [4, 8, 4] }} 
            transition={{ repeat: Infinity, duration: 1, delay: 0.4, ease: "easeInOut" }}
            className={`w-1 rounded-full ${isBreak ? 'bg-emerald-400/50' : 'bg-pure-white/50'}`} 
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.electron?.openAnalyticsWindow) {
              window.electron.openAnalyticsWindow();
            }
          }}
          className="flex items-center justify-center text-muted-gray hover:text-pure-white transition-colors ml-1"
          title="Open Advanced Analytics"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
