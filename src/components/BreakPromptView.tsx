import { motion } from 'framer-motion';
import { AppState } from '../App';
import { springTransition } from './DynamicIsland';
import { parseInterval } from '../utils/time';

interface Props {
  setAppState: (state: AppState) => void;
  startNewTimer: (minutes: number) => void;
}

export default function BreakPromptView({ setAppState, startNewTimer }: Props) {
  const delayRaw = localStorage.getItem('kause_delayInterval') || '10m';
  const breakRaw = localStorage.getItem('kause_breakInterval') || '5m';
  const delayLabel = delayRaw === '10s' ? '10s' : delayRaw === '5s' ? '5s' : delayRaw;
  const breakLabel = breakRaw === '10s' ? '10s' : breakRaw === '5s' ? '5s' : breakRaw;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={springTransition}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-between p-6 box-border"
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-muted-gray text-xs uppercase tracking-widest mt-1">Break Time</span>
        <h2 className="text-pure-white text-xl font-medium tracking-wide">Time to rest</h2>
      </div>
      
      <div className="w-full flex gap-3">
        <button 
          onClick={() => {
            if (window.electron?.logAnalyticsEvent) {
              window.electron.logAnalyticsEvent({ type: 'WORK_DELAYED', interval: delayRaw });
            }
            startNewTimer(parseInterval(delayRaw, 10));
            setAppState('WORK_ACTIVE');
          }}
          className="flex-1 py-3 bg-muted-gray/20 text-pure-white rounded-full font-medium text-sm hover:bg-muted-gray/40 transition-colors"
        >
          {delayLabel} Delay
        </button>
        <button 
          onClick={() => {
            startNewTimer(parseInterval(breakRaw, 5));
            setAppState('BREAK_ACTIVE');
          }}
          className="flex-1 py-3 bg-pure-white text-deep-black rounded-full font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          Start Break ({breakLabel})
        </button>
      </div>
    </motion.div>
  );
}
