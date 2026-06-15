import { useState, useEffect, useRef } from 'react';

export type NotificationType = 'EYE' | 'POSTURE' | 'UPDATE';

export function useNotifications(eyeMinutes: number, postureMinutes: number, isWorking: boolean) {
  const [queue, setQueue] = useState<NotificationType[]>([]);
  
  const eyeSecondsRef = useRef(eyeMinutes * 60);
  const postureSecondsRef = useRef(postureMinutes * 60);

  // When settings change, reset timers
  useEffect(() => {
    eyeSecondsRef.current = eyeMinutes * 60;
    postureSecondsRef.current = postureMinutes * 60;
  }, [eyeMinutes, postureMinutes]);

  useEffect(() => {
    if (!isWorking) return;
    
    let intervalId: ReturnType<typeof setInterval>;
    let wrappedCallback: any;

    const handleTick = () => {
      let newQueueItems: NotificationType[] = [];
      
      if (eyeMinutes > 0) {
        eyeSecondsRef.current -= 1;
        if (eyeSecondsRef.current <= 0) {
          newQueueItems.push('EYE');
          eyeSecondsRef.current = eyeMinutes * 60;
        }
      }

      if (postureMinutes > 0) {
        postureSecondsRef.current -= 1;
        if (postureSecondsRef.current <= 0) {
          newQueueItems.push('POSTURE');
          postureSecondsRef.current = postureMinutes * 60;
        }
      }

      if (newQueueItems.length > 0) {
        setQueue(prev => {
          const filtered = newQueueItems.filter(item => !prev.includes(item));
          return [...prev, ...filtered];
        });
      }
    };

    if (window.electron && window.electron.onTimerTick) {
      wrappedCallback = window.electron.onTimerTick(handleTick);
    } else {
      intervalId = setInterval(handleTick, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (window.electron && wrappedCallback) {
        window.electron.removeTimerTick(wrappedCallback);
      }
    };
  }, [eyeMinutes, postureMinutes, isWorking]);

  const popNotification = () => setQueue(prev => prev.slice(1));
  const clearQueue = () => setQueue([]);
  const pushNotification = (type: NotificationType) => setQueue(prev => prev.includes(type) ? prev : [...prev, type]);

  return { queue, popNotification, clearQueue, pushNotification };
}
