import { motion } from 'framer-motion';
import { AppState } from '../App';
import { useState } from 'react';
import { springTransition } from './DynamicIsland';

interface Props {
  setAppState: (state: AppState) => void;
  startNewTimer: (minutes: number) => void;
}

export default function Onboarding({ setAppState, startNewTimer }: Props) {
  const [tab, setTab] = useState<'register' | 'login'>('register');
  
  // Register State
  const [name, setName] = useState('');
  const [interval, setInterval] = useState('25');
  const [posture, setPosture] = useState(true);
  const [eyeCare, setEyeCare] = useState(true);

  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginError, setLoginError] = useState('');

  const parseInterval = (val: string, defaultVal: number) => {
    if (val === '10s') return 10 / 60;
    return Number(val) || defaultVal;
  };

  const handleStart = async () => {
    let finalKauseId = '';

    if (tab === 'register') {
      finalKauseId = 'KAUSE-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      localStorage.setItem('kause_id', finalKauseId);
      localStorage.setItem('kause_name', name || 'User');
      localStorage.setItem('kause_interval', interval);
      
      // Only set defaults if they don't exist
      if (!localStorage.getItem('kause_breakInterval')) localStorage.setItem('kause_breakInterval', '5m');
      if (!localStorage.getItem('kause_delayInterval')) localStorage.setItem('kause_delayInterval', '10m');
      if (!localStorage.getItem('kause_eyeInterval')) localStorage.setItem('kause_eyeInterval', eyeCare ? '20m' : 'Off');
      if (!localStorage.getItem('kause_postureInterval')) localStorage.setItem('kause_postureInterval', posture ? '20m' : 'Off');
      if (!localStorage.getItem('kause_autoResume')) localStorage.setItem('kause_autoResume', 'false');

      if (window.electron?.saveSettings) {
        window.electron.saveSettings(finalKauseId, {
          kause_name: localStorage.getItem('kause_name'),
          kause_interval: localStorage.getItem('kause_interval'),
          kause_breakInterval: localStorage.getItem('kause_breakInterval'),
          kause_delayInterval: localStorage.getItem('kause_delayInterval'),
          kause_eyeInterval: localStorage.getItem('kause_eyeInterval'),
          kause_postureInterval: localStorage.getItem('kause_postureInterval'),
          kause_autoResume: localStorage.getItem('kause_autoResume')
        });
      }
    } else {
      if (!loginId.trim()) return;
      finalKauseId = loginId.trim().toUpperCase();
      localStorage.setItem('kause_id', finalKauseId);
      
      if (window.electron?.getSettings) {
        const settings = await window.electron.getSettings(finalKauseId);
        if (settings && Object.keys(settings).length > 0) {
          Object.keys(settings).forEach(key => {
            localStorage.setItem(key, settings[key]);
          });
          setLoginError('');
        } else {
          setLoginError('Invalid Kause ID. Please check and try again.');
          return;
        }
      } else {
        // Fallback for non-electron env
        if (!localStorage.getItem('kause_name')) localStorage.setItem('kause_name', 'User');
        if (!localStorage.getItem('kause_interval')) localStorage.setItem('kause_interval', '25');
      }
    }

    if (window.electron?.setKauseId) {
      window.electron.setKauseId(finalKauseId);
    }

    const startInterval = tab === 'register' ? interval : (localStorage.getItem('kause_interval') || '25');
    startNewTimer(parseInterval(startInterval, 25));
    setAppState('WORK_ACTIVE');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={springTransition}
      className="w-full h-full flex flex-col items-center justify-between p-8 box-border absolute inset-0"
    >
      <div className="w-full space-y-6">
        <h2 className="text-pure-white text-xl font-medium text-center mb-2">Welcome to Kause</h2>
        
        <div className="flex gap-2 p-1 bg-muted-gray/20 rounded-full mb-4">
          <button 
            onClick={() => setTab('register')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${tab === 'register' ? 'bg-pure-white text-deep-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            Register
          </button>
          <button 
            onClick={() => setTab('login')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${tab === 'login' ? 'bg-pure-white text-deep-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            Login
          </button>
        </div>

        {tab === 'register' ? (
          <>
            <div className="space-y-2">
              <label className="text-muted-gray text-xs uppercase tracking-wider">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-transparent border-b border-muted-gray/30 text-pure-white text-sm pb-2 focus:outline-none focus:border-pure-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-muted-gray text-xs uppercase tracking-wider">Break Interval</label>
              <div className="flex items-center gap-2 pt-1">
                {['10s', '20', '25', '45'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setInterval(val)}
                    className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                      interval === val 
                        ? 'bg-pure-white text-deep-black shadow-sm' 
                        : 'bg-muted-gray/20 text-pure-white hover:bg-muted-gray/40'
                    }`}
                  >
                    {val === '10s' ? '10s' : `${val}m`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-pure-white text-sm">Posture Control</span>
              <button 
                onClick={() => setPosture(!posture)}
                className={`w-10 h-5 rounded-full transition-colors relative ${posture ? 'bg-pure-white' : 'bg-muted-gray/30'}`}
              >
                <motion.div 
                  layout
                  className={`w-4 h-4 rounded-full absolute top-0.5 ${posture ? 'bg-deep-black left-5' : 'bg-pure-white left-1'}`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-pure-white text-sm">Eye Care</span>
              <button 
                onClick={() => setEyeCare(!eyeCare)}
                className={`w-10 h-5 rounded-full transition-colors relative ${eyeCare ? 'bg-pure-white' : 'bg-muted-gray/30'}`}
              >
                <motion.div 
                  layout
                  className={`w-4 h-4 rounded-full absolute top-0.5 ${eyeCare ? 'bg-deep-black left-5' : 'bg-pure-white left-1'}`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-2 mt-8">
            <label className="text-muted-gray text-xs uppercase tracking-wider">Your Kause ID</label>
            <input 
              type="text" 
              value={loginId}
              onChange={(e) => {
                setLoginId(e.target.value);
                setLoginError('');
              }}
              placeholder="KAUSE-XXXXXX"
              className={`w-full bg-transparent border-b text-pure-white text-sm pb-2 focus:outline-none transition-colors ${loginError ? 'border-red-500' : 'border-muted-gray/30 focus:border-pure-white'}`}
            />
            {loginError ? (
              <p className="text-[10px] text-red-400 mt-2">{loginError}</p>
            ) : (
              <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">Enter your Kause ID to restore your analytics and settings across devices.</p>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={handleStart}
        className="mt-6 w-full py-3 bg-pure-white text-deep-black rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
      >
        {tab === 'register' ? 'Create Account' : 'Restore Data'}
      </button>
    </motion.div>
  );
}
