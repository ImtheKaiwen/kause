import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppState } from '../App';
import { springTransition } from './DynamicIsland';
import { parseInterval } from '../utils/time';

interface Props {
  setAppState: (state: AppState) => void;
  startNewTimer: (minutes: number) => void;
  resume: () => void;
  reloadSettings?: () => void;
  returnToState?: AppState;
}

const intervals = ['10s', '20m', '25m', '45m'];
const breakIntervals = ['5s', '10s', '5m', '10m'];
const delayIntervals = ['5s', '10s', '5m', '10m'];
const eyeIntervals = ['Off', '5s', '1m', '20m'];
const postureIntervals = ['Off', '10s', '5m', '20m'];

export default function Dashboard({ setAppState, startNewTimer, resume, reloadSettings, returnToState = 'WORK_ACTIVE' }: Props) {
  const [name, setName] = useState('');
  const [interval, setInterval] = useState('25m');
  const [breakInterval, setBreakInterval] = useState('5m');
  const [delayInterval, setDelayInterval] = useState('10m');
  const [eyeInterval, setEyeInterval] = useState('20m');
  const [postureInterval, setPostureInterval] = useState('20m');
  const [autoResume, setAutoResume] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem('kause_name') || '');
    setInterval(localStorage.getItem('kause_interval') || '25m');
    setBreakInterval(localStorage.getItem('kause_breakInterval') || '5m');
    setDelayInterval(localStorage.getItem('kause_delayInterval') || '10m');
    setEyeInterval(localStorage.getItem('kause_eyeInterval') || '20m');
    setPostureInterval(localStorage.getItem('kause_postureInterval') || '20m');
    setAutoResume(localStorage.getItem('kause_autoResume') === 'true');
  }, []);

  const handleSave = () => {
    localStorage.setItem('kause_name', name);
    
    const oldInterval = localStorage.getItem('kause_interval');
    const oldBreakInterval = localStorage.getItem('kause_breakInterval');
    
    localStorage.setItem('kause_interval', interval);
    localStorage.setItem('kause_breakInterval', breakInterval);
    localStorage.setItem('kause_delayInterval', delayInterval);
    localStorage.setItem('kause_eyeInterval', eyeInterval);
    localStorage.setItem('kause_postureInterval', postureInterval);
    localStorage.setItem('kause_autoResume', String(autoResume));
    
    const kauseId = localStorage.getItem('kause_id');
    if (window.electron?.saveSettings && kauseId) {
      window.electron.saveSettings(kauseId, {
        kause_name: name,
        kause_interval: interval,
        kause_breakInterval: breakInterval,
        kause_delayInterval: delayInterval,
        kause_eyeInterval: eyeInterval,
        kause_postureInterval: postureInterval,
        kause_autoResume: String(autoResume)
      });
    }

    if (reloadSettings) reloadSettings();

    if (returnToState === 'WORK_ACTIVE' && oldInterval !== interval) {
      startNewTimer(parseInterval(interval, 25));
    } else if (returnToState === 'BREAK_ACTIVE' && oldBreakInterval !== breakInterval) {
      startNewTimer(parseInterval(breakInterval, 5));
    } else if (returnToState === 'WORK_ACTIVE' || returnToState === 'BREAK_ACTIVE') {
      resume();
    }
    
    setAppState(returnToState);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={springTransition}
      className="absolute inset-0 w-full h-full flex flex-col p-8 pb-10 box-border overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-pure-white text-lg font-semibold tracking-wide">Dashboard</h2>
        <button 
          onClick={() => { 
            if (returnToState === 'WORK_ACTIVE' || returnToState === 'BREAK_ACTIVE') resume(); 
            setAppState(returnToState); 
          }} 
          className="text-muted-gray hover:text-pure-white transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div>
          <label className="text-muted-gray text-xs font-medium uppercase tracking-widest mb-2 block">Your Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b border-muted-gray/30 text-pure-white pb-2 text-sm focus:outline-none focus:border-pure-white transition-colors"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="text-muted-gray text-xs font-medium uppercase tracking-widest mb-2 block">Work Interval</label>
          <div className="flex gap-2">
            {intervals.map(i => (
              <button 
                key={i}
                onClick={() => setInterval(i)}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${interval === i ? 'bg-pure-white text-deep-black' : 'bg-muted-gray/20 text-pure-white hover:bg-muted-gray/40'}`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-muted-gray text-xs font-medium uppercase tracking-widest mb-2 block">Break Interval</label>
          <div className="flex gap-2">
            {breakIntervals.map(i => (
              <button 
                key={i}
                onClick={() => setBreakInterval(i)}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${breakInterval === i ? 'bg-pure-white text-deep-black' : 'bg-muted-gray/20 text-pure-white hover:bg-muted-gray/40'}`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-muted-gray text-xs font-medium uppercase tracking-widest mb-2 block">Delay Interval</label>
          <div className="flex gap-2">
            {delayIntervals.map(i => (
              <button 
                key={i}
                onClick={() => setDelayInterval(i)}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${delayInterval === i ? 'bg-pure-white text-deep-black' : 'bg-muted-gray/20 text-pure-white hover:bg-muted-gray/40'}`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-muted-gray text-xs font-medium uppercase tracking-widest mb-2 block">Eye Care Interval</label>
          <div className="flex gap-2">
            {eyeIntervals.map(i => (
              <button 
                key={i}
                onClick={() => setEyeInterval(i)}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${eyeInterval === i ? 'bg-pure-white text-deep-black' : 'bg-muted-gray/20 text-pure-white hover:bg-muted-gray/40'}`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-muted-gray text-xs font-medium uppercase tracking-widest mb-2 block">Posture Interval</label>
          <div className="flex gap-2">
            {postureIntervals.map(i => (
              <button 
                key={i}
                onClick={() => setPostureInterval(i)}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${postureInterval === i ? 'bg-pure-white text-deep-black' : 'bg-muted-gray/20 text-pure-white hover:bg-muted-gray/40'}`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-1">
          <label className="text-pure-white text-sm font-medium">Auto-Resume Work</label>
          <button 
            onClick={() => setAutoResume(!autoResume)}
            className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${autoResume ? 'bg-pure-white' : 'bg-muted-gray/40'}`}
          >
            <motion.div 
              layout
              className={`w-4 h-4 rounded-full bg-deep-black shadow-sm ${autoResume ? 'ml-auto' : ''}`}
            />
          </button>
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="mt-6 shrink-0 w-full py-2.5 bg-pure-white text-deep-black rounded-full font-medium text-sm hover:bg-gray-200 transition-colors"
      >
        Save Changes
      </button>
    </motion.div>
  );
}
