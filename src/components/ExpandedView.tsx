import { motion } from 'framer-motion';
import { AppState } from '../App';
import { springTransition } from './DynamicIsland';

interface Props {
  setAppState: (state: AppState) => void;
  startNewTimer: (minutes: number) => void;
}

export default function ExpandedView({ setAppState, startNewTimer }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.15, delay: 0.05 } }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={springTransition}
      className="w-full h-full flex flex-col items-center justify-center p-6 box-border relative"
    >
      <div className="flex-1 flex items-center justify-center">
        <h2 className="text-pure-white text-2xl font-light tracking-wide">Time to break.</h2>
      </div>
      
      <div className="w-full flex gap-3 mt-4">
        <button 
          onClick={() => {
            startNewTimer(10); // 10 minutes delay
            setAppState('COMPACT');
          }}
          className="flex-1 py-2.5 bg-pure-white/10 text-pure-white rounded-full text-sm font-medium hover:bg-pure-white/20 transition-colors"
        >
          10m Delay
        </button>
        <button 
          onClick={() => {
            startNewTimer(5); // For MVP, we just reset to 5 minutes as a "break timer"
            setAppState('COMPACT');
          }}
          className="flex-1 py-2.5 bg-pure-white text-deep-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Start Break
        </button>
      </div>
    </motion.div>
  );
}
