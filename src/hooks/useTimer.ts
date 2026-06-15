import { useState, useEffect, useCallback } from 'react';

export function useTimer(initialMinutes: number = 25) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let wrappedCallback: any;

    if (isActive) {
      if (window.electron && window.electron.startTimerTick) {
        window.electron.startTimerTick();
        
        const handleTick = () => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              window.electron.stopTimerTick();
              setIsActive(false);
              return 0;
            }
            return prev - 1;
          });
        };
        
        wrappedCallback = window.electron.onTimerTick(handleTick);
      } else {
        intervalId = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsActive(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (window.electron && window.electron.stopTimerTick) {
        window.electron.stopTimerTick();
        if (wrappedCallback) {
          window.electron.removeTimerTick(wrappedCallback);
        }
      }
    };
  }, [isActive]);

  const resume = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback((minutes: number = initialMinutes) => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
  }, [initialMinutes]);

  const startNewTimer = useCallback((minutes: number) => {
    setTimeLeft(minutes * 60);
    setIsActive(true);
  }, []);

  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return { timeLeft, formattedTime, isActive, resume, pause, reset, startNewTimer, isFinished: timeLeft === 0 && !isActive };
}
