import { useState, useEffect } from 'react';
import DynamicIsland from './components/DynamicIsland';
import AnalyticsApp from './components/AnalyticsApp';
import { useTimer } from './hooks/useTimer';
import { useNotifications, NotificationType } from './hooks/useNotifications';
import { parseInterval } from './utils/time';

export type AppState = 'SPLASH' | 'ONBOARDING' | 'WORK_ACTIVE' | 'WORK_PAUSED' | 'BREAK_PROMPT' | 'BREAK_ACTIVE' | 'BREAK_PAUSED' | 'WORK_PROMPT' | 'STARTUP_PROMPT' | 'DASHBOARD' | 'NOTIFICATION';

function App() {
  const isAnalyticsWindow = window.location.search.includes('window=analytics');

  const [appState, setAppState] = useState<AppState>('SPLASH');
  const [returnToState, setReturnToState] = useState<AppState>('WORK_ACTIVE');
  const { formattedTime, startNewTimer, isFinished, pause, resume } = useTimer(25);
  
  const [eyeInterval, setEyeInterval] = useState(0);
  const [postureInterval, setPostureInterval] = useState(0);
  const [activeNotification, setActiveNotification] = useState<NotificationType | null>(null);

  const { queue, popNotification, clearQueue, pushNotification } = useNotifications(eyeInterval, postureInterval, appState === 'WORK_ACTIVE' && !isAnalyticsWindow);

  const handleMouseEnter = () => {
    if (window.electron && !isAnalyticsWindow) window.electron.setIgnoreMouseEvents(false);
  };

  const handleMouseLeave = () => {
    if (window.electron && !isAnalyticsWindow) window.electron.setIgnoreMouseEvents(true, { forward: true });
  };

  // Reload settings
  const loadSettings = () => {
    setEyeInterval(parseInterval(localStorage.getItem('kause_eyeInterval'), 0));
    setPostureInterval(parseInterval(localStorage.getItem('kause_postureInterval'), 0));
  };

  useEffect(() => {
    if (isAnalyticsWindow) return;
    
    if (window.electron?.onResetApp) {
      window.electron.onResetApp(() => {
        pause();
        localStorage.clear();
        setAppState('ONBOARDING');
      });
    }

    if (window.electron?.onSettingsUpdated) {
      window.electron.onSettingsUpdated(() => {
        loadSettings();
        const newInterval = localStorage.getItem('kause_interval') || '25';
        
        // Only update the timer if we are in a work-related state
        if (appState === 'WORK_ACTIVE' || appState === 'WORK_PAUSED' || appState === 'WORK_PROMPT') {
          startNewTimer(parseInterval(newInterval, 25));
          if (appState === 'WORK_PAUSED') pause();
        }
      });
    }

    if (window.electron?.onUpdateDownloaded) {
      window.electron.onUpdateDownloaded(() => {
        pushNotification('UPDATE');
      });
    }

    return () => {
      if (window.electron?.removeAllListeners) {
        window.electron.removeAllListeners('reset-app');
        window.electron.removeAllListeners('settings-updated');
        window.electron.removeAllListeners('update-downloaded');
      }
    };
  }, [appState, startNewTimer, isAnalyticsWindow, pause, pushNotification]);

  // Splash Screen Timer (Runs ONCE on mount)
  useEffect(() => {
    if (isAnalyticsWindow) return;

    const splashTimer = setTimeout(() => {
      const kauseId = localStorage.getItem('kause_id');
      if (kauseId && window.electron?.setKauseId) {
        window.electron.setKauseId(kauseId);
      }

      const currentName = localStorage.getItem('kause_name');
      const currentInterval = localStorage.getItem('kause_interval');

      if (currentName && currentInterval) {
        setAppState('STARTUP_PROMPT');
      } else {
        setAppState('ONBOARDING');
      }
    }, 2500);

    return () => clearTimeout(splashTimer);
  }, [isAnalyticsWindow]);

  // Handle Timer finishes
  useEffect(() => {
    if (isFinished) {
      if (appState === 'WORK_ACTIVE' || appState === 'NOTIFICATION') {
        clearQueue();
        if (window.electron?.logAnalyticsEvent) {
          window.electron.logAnalyticsEvent({ type: 'WORK_COMPLETED', interval: localStorage.getItem('kause_interval') });
        }
        setAppState('BREAK_PROMPT');
      } else if (appState === 'BREAK_ACTIVE') {
        if (window.electron?.logAnalyticsEvent) {
          window.electron.logAnalyticsEvent({ type: 'BREAK_COMPLETED', interval: localStorage.getItem('kause_breakInterval') });
        }
        const autoResume = localStorage.getItem('kause_autoResume') === 'true';
        if (autoResume) {
          startNewTimer(parseInterval(localStorage.getItem('kause_interval'), 25));
          setAppState('WORK_ACTIVE');
        } else {
          setAppState('WORK_PROMPT');
        }
      }
    }
  }, [isFinished, appState, startNewTimer, clearQueue]);

  // Handle Notification Queue
  useEffect(() => {
    if (appState === 'WORK_ACTIVE' && queue.length > 0) {
      const nextNotification = queue[0];
      setActiveNotification(nextNotification);
      setAppState('NOTIFICATION');
      pause(); // Pause work timer while notification is showing
      
      if (window.electron?.logAnalyticsEvent) {
        window.electron.logAnalyticsEvent({ type: `WARNING_${nextNotification}` });
      }

      // Auto-dismiss notification after 3.5 seconds
      setTimeout(() => {
        popNotification();
        setActiveNotification(null);
        resume();
        setAppState('WORK_ACTIVE');
      }, 3500);
    }
  }, [queue, appState, pause, resume, popNotification]);

  if (isAnalyticsWindow) {
    return <AnalyticsApp />;
  }

  return (
    <div className="w-full h-screen flex justify-center items-start pt-6">
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
        <DynamicIsland 
          appState={appState} 
          setAppState={setAppState} 
          formattedTime={formattedTime}
          startNewTimer={startNewTimer}
          pause={pause}
          resume={resume}
          reloadSettings={loadSettings}
          activeNotification={activeNotification}
          returnToState={returnToState}
          setReturnToState={setReturnToState}
        />
      </div>
    </div>
  );
}

export default App;
