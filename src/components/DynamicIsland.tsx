import { motion, AnimatePresence } from 'framer-motion';
import { AppState } from '../App';
import Splash from './Splash';
import Onboarding from './Onboarding';
import CompactView from './CompactView';
import WorkPausedView from './WorkPausedView';
import BreakPausedView from './BreakPausedView';
import BreakPromptView from './BreakPromptView';
import WorkPromptView from './WorkPromptView';
import StartupPromptView from './StartupPromptView';
import Dashboard from './Dashboard';
import NotificationView from './NotificationView';
import { NotificationType } from '../hooks/useNotifications';

export const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 1
};

const islandSizes = {
  SPLASH: { width: 160, height: 60 },
  ONBOARDING: { width: 340, height: 480 },
  WORK_ACTIVE: { width: 160, height: 48 },
  WORK_PAUSED: { width: 240, height: 56 },
  BREAK_PROMPT: { width: 320, height: 160 },
  BREAK_ACTIVE: { width: 160, height: 48 },
  BREAK_PAUSED: { width: 240, height: 56 },
  WORK_PROMPT: { width: 320, height: 160 },
  STARTUP_PROMPT: { width: 320, height: 160 },
  DASHBOARD: { width: 340, height: 680 },
  NOTIFICATION: { width: 280, height: 140 }
};

interface Props {
  appState: AppState;
  setAppState: (state: AppState) => void;
  formattedTime: string;
  startNewTimer: (minutes: number) => void;
  pause: () => void;
  resume: () => void;
  reloadSettings?: () => void;
  activeNotification?: NotificationType | null;
  returnToState: AppState;
  setReturnToState: (state: AppState) => void;
}

export default function DynamicIsland({ appState, setAppState, formattedTime, startNewTimer, pause, resume, reloadSettings, activeNotification, returnToState, setReturnToState }: Props) {
  return (
    <motion.div
      layout
      initial={false}
      animate={{
        width: islandSizes[appState].width,
        height: islandSizes[appState].height,
        borderRadius: appState === 'WORK_ACTIVE' || appState === 'BREAK_ACTIVE' ? 24 : 32
      }}
      transition={springTransition}
      className="bg-deep-black overflow-hidden relative"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
      }}
    >
      <AnimatePresence mode="popLayout">
        {appState === 'SPLASH' && <Splash key="splash" />}
        {appState === 'ONBOARDING' && <Onboarding key="onboarding" setAppState={setAppState} startNewTimer={startNewTimer} />}
        {appState === 'WORK_ACTIVE' && <CompactView key="work_active" onClick={() => { pause(); setAppState('WORK_PAUSED'); }} formattedTime={formattedTime} isBreak={false} />}
        {appState === 'BREAK_ACTIVE' && <CompactView key="break_active" onClick={() => { pause(); setAppState('BREAK_PAUSED'); }} formattedTime={formattedTime} isBreak={true} />}
        {appState === 'WORK_PAUSED' && <WorkPausedView key="work_paused" resume={() => { resume(); setAppState('WORK_ACTIVE'); }} setAppState={(state) => { if (state === 'DASHBOARD') setReturnToState('WORK_ACTIVE'); setAppState(state); }} />}
        {appState === 'BREAK_PAUSED' && <BreakPausedView key="break_paused" resume={() => { resume(); setAppState('BREAK_ACTIVE'); }} setAppState={(state) => { if (state === 'DASHBOARD') setReturnToState('BREAK_ACTIVE'); setAppState(state); }} />}
        {appState === 'BREAK_PROMPT' && <BreakPromptView key="break_prompt" startNewTimer={startNewTimer} setAppState={setAppState} />}
        {appState === 'WORK_PROMPT' && <WorkPromptView key="work_prompt" startNewTimer={startNewTimer} setAppState={setAppState} />}
        {appState === 'STARTUP_PROMPT' && <StartupPromptView key="startup_prompt" startNewTimer={startNewTimer} setAppState={setAppState} setReturnToState={setReturnToState} />}
        {appState === 'DASHBOARD' && <Dashboard key="dashboard" setAppState={setAppState} startNewTimer={startNewTimer} resume={resume} reloadSettings={reloadSettings} returnToState={returnToState} />}
        {appState === 'NOTIFICATION' && <NotificationView key="notification" type={activeNotification || null} />}
      </AnimatePresence>
    </motion.div>
  );
}
