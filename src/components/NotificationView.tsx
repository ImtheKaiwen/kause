import { motion } from 'framer-motion';
import { NotificationType } from '../hooks/useNotifications';
import { springTransition } from './DynamicIsland';

interface Props {
  type: NotificationType | null;
}

export default function NotificationView({ type }: Props) {
  if (!type) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={springTransition}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 bg-deep-black"
    >
      {type === 'EYE' && (
        <>
          <motion.div 
            animate={{ 
              scaleY: [1, 0.1, 1, 1, 0.1, 1],
            }}
            transition={{
              duration: 2,
              times: [0, 0.1, 0.2, 0.8, 0.9, 1],
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="w-12 h-12 flex items-center justify-center text-pure-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </motion.div>
          <span className="text-pure-white text-base font-medium tracking-wide">Blink your eyes</span>
        </>
      )}

      {type === 'POSTURE' && (
        <>
          <motion.div 
            animate={{ 
              rotateX: [20, 0, 0],
              y: [5, 0, 0]
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="w-12 h-12 flex items-center justify-center text-pure-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
            </svg>
          </motion.div>
          <span className="text-pure-white text-base font-medium tracking-wide">Fix your posture</span>
        </>
      )}

      {type === 'UPDATE' && (
        <>
          <motion.div 
            animate={{ 
              y: [0, -5, 0]
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity
            }}
            className="w-12 h-12 flex items-center justify-center text-blue-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </motion.div>
          <div className="flex flex-col items-center">
            <span className="text-pure-white text-base font-medium tracking-wide">Update Ready!</span>
            <span className="text-muted-gray text-xs">Check Settings to install.</span>
          </div>
        </>
      )}
    </motion.div>
  );
}
