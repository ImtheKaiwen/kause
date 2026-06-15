import { motion } from 'framer-motion';
import { AppState } from '../App';
import { springTransition } from './DynamicIsland';

interface Props {
  resume: () => void;
  setAppState: (state: AppState) => void;
}

export default function WorkPausedView({ resume, setAppState }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={springTransition}
      className="absolute inset-0 w-full h-full flex items-center justify-between px-5 box-border"
    >
      <span className="text-pure-white text-sm font-semibold pl-1">Paused</span>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => { resume(); setAppState('WORK_ACTIVE'); }}
          className="px-5 py-1.5 rounded-full bg-pure-white text-deep-black text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Resume
        </button>
        <button 
          onClick={() => setAppState('DASHBOARD')}
          className="w-8 h-8 rounded-full bg-muted-gray/20 text-pure-white flex items-center justify-center hover:bg-muted-gray/40 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
