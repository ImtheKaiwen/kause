import { motion } from 'framer-motion';
import { AppState } from '../App';
import { springTransition } from './DynamicIsland';
import { parseInterval } from '../utils/time';

interface Props {
  setAppState: (state: AppState) => void;
  startNewTimer: (minutes: number) => void;
}

export default function WorkPromptView({ setAppState, startNewTimer }: Props) {
  const workRaw = localStorage.getItem('kause_interval') || '25m';
  const delayRaw = localStorage.getItem('kause_delayInterval') || '10m';
  
  const delayLabel = delayRaw === '10s' ? '10s' : delayRaw === '5s' ? '5s' : delayRaw;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={springTransition}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 box-border bg-deep-black"
    >
      <h2 className="text-pure-white text-xl font-semibold tracking-wide mb-2">Ready to Focus?</h2>
      <p className="text-muted-gray text-sm mb-6">Your break is over.</p>
      
      <div className="w-full flex gap-3">
        <button 
          onClick={() => {
            if (window.electron?.logAnalyticsEvent) {
              window.electron.logAnalyticsEvent({ type: 'BREAK_DELAYED', interval: delayRaw });
            }
            startNewTimer(parseInterval(delayRaw, 10));
            setAppState('BREAK_ACTIVE');
          }}
          className="flex-1 py-3 bg-muted-gray/20 text-pure-white rounded-full font-medium text-sm hover:bg-muted-gray/40 transition-colors"
        >
          {delayLabel} Delay
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
