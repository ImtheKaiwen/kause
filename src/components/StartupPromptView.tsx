import { motion } from 'framer-motion';
import { AppState } from '../App';
import { springTransition } from './DynamicIsland';
import { parseInterval } from '../utils/time';

interface Props {
  setAppState: (state: AppState) => void;
  startNewTimer: (minutes: number) => void;
  setReturnToState: (state: AppState) => void;
}

export default function StartupPromptView({ setAppState, startNewTimer, setReturnToState }: Props) {
  const workRaw = localStorage.getItem('kause_interval') || '25m';
  const name = localStorage.getItem('kause_name') || 'User';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={springTransition}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 box-border bg-deep-black"
    >
      <h2 className="text-pure-white text-xl font-semibold tracking-wide mb-2">Welcome back, {name}!</h2>
      <p className="text-muted-gray text-sm mb-6">Ready to start a new session?</p>
      
      <div className="w-full flex gap-3">
        <button 
          onClick={() => {
            setReturnToState('STARTUP_PROMPT');
            setAppState('DASHBOARD');
          }}
          className="flex-1 py-3 bg-muted-gray/20 text-pure-white rounded-full font-medium text-sm hover:bg-muted-gray/40 transition-colors"
        >
          Dashboard
        </button>
        <button 
          onClick={() => {
            startNewTimer(parseInterval(workRaw, 25));
            setAppState('WORK_ACTIVE');
          }}
          className="flex-1 py-3 bg-pure-white text-deep-black rounded-full font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          Start Work
        </button>
      </div>
    </motion.div>
  );
}
