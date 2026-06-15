export {};

declare global {
  interface Window {
    electron: {
      setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => void;
      startTimerTick: () => void;
      stopTimerTick: () => void;
      onTimerTick: (callback: (timeLeft: number) => void) => any;
      removeTimerTick: (callback: (event: any, ...args: any[]) => void) => void;
      logAnalyticsEvent: (data: any) => void;
      getAnalytics: () => Promise<any[]>;
      getScreenTime: () => Promise<number>;
      exportCsv: (csvContent: string) => Promise<boolean>;
      openAnalyticsWindow: () => void;
      minimizeAnalytics: () => void;
      maximizeAnalytics: () => void;
      closeAnalytics: () => void;
      setKauseId: (id: string) => void;
      downloadRecoveryId: (content: string) => Promise<boolean>;
      resetApp: () => void;
      onResetApp: (callback: () => void) => void;
      onSettingsUpdated: (callback: () => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
      installUpdate: () => void;
      removeAllListeners: (channel: string) => void;
      saveSettings: (id: string, settings: any) => void;
      getSettings: (id: string) => Promise<any>;
    };
  }
}
