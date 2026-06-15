import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AnalyticEvent {
  timestamp: string;
  type: string;
  interval?: string;
}

type TabType = 'Home' | 'Activity' | 'Focus' | 'Vision' | 'Posture' | 'Support' | 'Settings';

export default function AnalyticsApp() {
  const [events, setEvents] = useState<AnalyticEvent[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const [screenTimeMin, setScreenTimeMin] = useState<number>(0);

  // Settings State
  const [settingsName, setSettingsName] = useState(localStorage.getItem('kause_name') || 'User');
  const [settingsWork, setSettingsWork] = useState((localStorage.getItem('kause_interval') || '25').replace('m', ''));
  const [settingsBreak, setSettingsBreak] = useState((localStorage.getItem('kause_breakInterval') || '5m').replace('m', ''));
  const [settingsEye, setSettingsEye] = useState((localStorage.getItem('kause_eyeInterval') || '20m').replace('m', ''));
  const [settingsPosture, setSettingsPosture] = useState((localStorage.getItem('kause_postureInterval') || '15m').replace('m', ''));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [kauseId] = useState(localStorage.getItem('kause_id') || '');
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (window.electron?.onUpdateDownloaded) {
      window.electron.onUpdateDownloaded(() => {
        setUpdateReady(true);
      });
    }
    return () => {
      if (window.electron?.removeAllListeners) {
        window.electron.removeAllListeners('update-downloaded');
      }
    };
  }, []);

  useEffect(() => {
    if (window.electron?.getAnalytics) {
      window.electron.getAnalytics().then(setEvents);
    }
    if (window.electron?.getScreenTime) {
      window.electron.getScreenTime().then(setScreenTimeMin);
      
      const interval = setInterval(() => {
        window.electron.getScreenTime().then(setScreenTimeMin);
      }, 60000); // Check screen time every minute
      
      return () => clearInterval(interval);
    }
  }, []);

  const handleExport = () => {
    if (!window.electron?.exportCsv) return;
    const header = "Timestamp,Type,Interval\n";
    const rows = events.map(e => `${e.timestamp},${e.type},${e.interval || ''}`).join('\n');
    window.electron.exportCsv(header + rows);
  };

  const handleClose = () => window.electron?.closeAnalytics();
  const handleMinimize = () => window.electron?.minimizeAnalytics();
  const handleMaximize = () => window.electron?.maximizeAnalytics();

  const stats = useMemo(() => {
    let focusCount = 0;
    let breakCount = 0;
    let postureWarnings = 0;
    let eyeWarnings = 0;
    
    events.forEach(e => {
      if (e.type === 'WORK_COMPLETED') focusCount++;
      if (e.type === 'BREAK_COMPLETED') breakCount++;
      if (e.type === 'WARNING_POSTURE') postureWarnings++;
      if (e.type === 'WARNING_EYE') eyeWarnings++;
    });
    return { focusCount, breakCount, postureWarnings, eyeWarnings };
  }, [events]);

  const chartData = useMemo(() => {
    const days: Record<string, any> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days[dateStr] = { date: dateStr, focus: 0, break: 0, posture: 0, eye: 0 };
    }

    events.forEach(e => {
      const dateStr = e.timestamp.split('T')[0];
      if (days[dateStr]) {
        if (e.type === 'WORK_COMPLETED') days[dateStr].focus += 1;
        if (e.type === 'BREAK_COMPLETED') days[dateStr].break += 1;
        if (e.type === 'WARNING_POSTURE') days[dateStr].posture += 1;
        if (e.type === 'WARNING_EYE') days[dateStr].eye += 1;
      }
    });

    return Object.values(days).map(d => ({
      ...d,
      label: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
    }));
  }, [events]);

  const formatScreenTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const renderContent = () => {
    if (activeTab === 'Home') {
      return (
        <>
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Daily Wellness</h2>
              <p className="text-sm text-gray-500 font-medium">Tracking your occupational health in real-time.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExport}
                className="text-xs bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-full font-bold transition-colors shadow-sm flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Top KPI Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* SCREEN TIME */}
            <div className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gray-50 p-2 rounded-xl text-gray-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Screen Time</span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{formatScreenTime(screenTimeMin)}</h3>
                </div>
              </div>
            </div>

            {/* BREAKS */}
            <div className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gray-50 p-2 rounded-xl text-gray-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Breaks</span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{stats.breakCount}</h3>
                  <span className="text-gray-400 text-xs font-medium uppercase">Total</span>
                </div>
              </div>
            </div>

            {/* POSTURE & BLINK */}
            <div className="col-span-1 flex flex-col gap-4">
              <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14"></path><path d="M5 12l7-7 7 7"></path></svg>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Posture Slumps</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold leading-none">{stats.postureWarnings}</span>
                      {stats.postureWarnings > 10 && <span className="text-orange-500 text-[10px] font-bold">Critical</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-xl text-blue-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Blink Rate Avg</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold leading-none">{stats.eyeWarnings}</span>
                      <span className="text-gray-400 text-[10px] font-medium">per min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">Work Session Summary</h3>
                  <p className="text-xs text-gray-400 font-medium">Visualizing intensity vs. wellness breaks.</p>
                </div>
              </div>
              
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={10}>
                    <XAxis dataKey="label" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} dy={10} fontWeight={600} />
                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} dx={-10} fontWeight={600} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px', color: '#ffffff', padding: '10px 14px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
                      itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 500 }}
                    />
                    <Bar dataKey="focus" name="Focus Sessions" fill="#111827" radius={[8, 8, 8, 8]} />
                    <Bar dataKey="break" name="Breaks" fill="#E5E7EB" radius={[8, 8, 8, 8]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-1 bg-black rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-end min-h-[220px]">
              <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
              <div 
                className="absolute inset-0 bg-cover bg-center z-0" 
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=600)' }} 
              />
              
              <div className="relative z-20">
                <h3 className="text-lg font-bold mb-1 tracking-tight">Wellness Insight</h3>
                <p className="text-xs text-gray-300 font-medium mb-4 leading-relaxed">
                  Regularly following the 20-20-20 rule reduces eye strain by up to 40%. Kause tracks your blink rate locally to keep your eyes healthy.
                </p>
                <button 
                  onClick={() => setActiveTab('Vision')}
                  className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs hover:bg-gray-100 transition-colors shadow-lg active:scale-95"
                >
                  Guide Me
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'Activity') {
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Activity Log</h2>
            <p className="text-sm text-gray-500 font-medium">A complete history of your focus and breaks.</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="pb-3 pr-6">Date & Time</th>
                    <th className="pb-3 pr-6">Event Type</th>
                    <th className="pb-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {events.slice().reverse().map((e, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-6 text-gray-500">{new Date(e.timestamp).toLocaleString()}</td>
                      <td className="py-3 pr-6">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          e.type.includes('WORK') ? 'bg-black text-white' :
                          e.type.includes('BREAK') ? 'bg-[#E6F8ED] text-[#2D9B50]' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {e.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-gray-900 font-bold">{e.interval || '-'}</td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-400">No activity recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'Focus') {
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Focus & Intensity</h2>
            <p className="text-sm text-gray-500 font-medium">Deep dive into your deep work sessions.</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-bold mb-6">Focus Trends (Last 7 Days)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={16}>
                  <XAxis dataKey="label" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} dy={10} fontWeight={600} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} dx={-10} fontWeight={600} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px', color: '#ffffff', padding: '10px 14px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
                    itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 500 }}
                  />
                  <Bar dataKey="focus" name="Focus Sessions" fill="#111827" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'Vision' || activeTab === 'Posture') {
      const isVision = activeTab === 'Vision';
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">{isVision ? 'Vision Care' : 'Posture Health'}</h2>
            <p className="text-sm text-gray-500 font-medium">{isVision ? 'Tracking your eye strain and blink rates.' : 'Monitoring your spinal alignment and slumps.'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-6">Warnings Trend (7 Days)</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} dy={10} fontWeight={600} />
                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} dx={-10} fontWeight={600} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: '#000000', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey={isVision ? "eye" : "posture"} name="Warnings" stroke={isVision ? "#3b82f6" : "#fb923c"} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`rounded-3xl p-6 text-white flex flex-col justify-center ${isVision ? 'bg-blue-600' : 'bg-orange-500'}`}>
              <h3 className="text-2xl font-bold mb-3">{isVision ? 'The 20-20-20 Rule' : 'Perfect Posture'}</h3>
              <p className="text-sm font-medium opacity-90 leading-relaxed">
                {isVision 
                  ? 'Every 20 minutes, look at something 20 feet away for 20 seconds. This simple habit drastically reduces digital eye strain and prevents dry eyes.' 
                  : 'Keep your screen at eye level. Sit back in your chair, keeping your back straight and your feet flat on the floor. Avoid leaning forward towards the monitor.'}
              </p>
            </div>
          </div>
        </>
      );
    }
    
    if (activeTab === 'Support') {
      return (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Help & Support</h2>
            <p className="text-sm text-gray-500 font-medium">Get assistance and learn how to maximize your wellness.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-3">How to correct your posture?</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  1. Keep your monitor at eye level to prevent looking down.<br/>
                  2. Sit back in your chair, supporting your lower back.<br/>
                  3. Keep your feet flat on the floor or on a footrest.<br/>
                  4. Keep your elbows bent at a 90-degree angle close to your body.<br/>
                  5. Make sure to take a 5-minute break every hour to stretch.
                </p>
              </div>
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-3">How does Kause track my data?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Kause securely monitors your webcam feed strictly locally on your device. We use machine learning algorithms to detect posture slumps and blink rates without ever saving or sending video data to the cloud. Your privacy is 100% guaranteed.
                </p>
              </div>
            </div>

            <div className="col-span-1">
              <div className="bg-black rounded-3xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-3">Need more help?</h3>
                <p className="text-xs text-gray-400 font-medium mb-6 leading-relaxed">
                  If you have feature requests, bug reports, or just want to say hi, feel free to reach out to our team directly.
                </p>
                <a 
                  href="mailto:kaiwen.info@gmail.com" 
                  className="block w-full bg-white text-black text-center px-4 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95 break-all text-[11px]"
                >
                  kaiwen.info@gmail.com
                </a>
              </div>
            </div>
          </div>
        </>
      );
    }
    if (activeTab === 'Settings') {
      const handleSaveSettings = () => {
        localStorage.setItem('kause_name', settingsName);
        const formatVal = (val: string) => val === 'Off' ? 'Off' : val.endsWith('s') ? val : `${val}m`;
        
        localStorage.setItem('kause_interval', settingsWork.endsWith('s') ? settingsWork : `${settingsWork}m`);
        localStorage.setItem('kause_breakInterval', formatVal(settingsBreak));
        localStorage.setItem('kause_eyeInterval', formatVal(settingsEye));
        localStorage.setItem('kause_postureInterval', formatVal(settingsPosture));
        
        if (window.electron?.saveSettings && kauseId) {
          window.electron.saveSettings(kauseId, {
            kause_name: settingsName,
            kause_interval: settingsWork.endsWith('s') ? settingsWork : `${settingsWork}m`,
            kause_breakInterval: formatVal(settingsBreak),
            kause_eyeInterval: formatVal(settingsEye),
            kause_postureInterval: formatVal(settingsPosture)
          });
        }

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      };

      const handleDownloadId = () => {
        if (!window.electron?.downloadRecoveryId) return;
        const content = `Welcome to Kause!\n\nYour secret Kause ID is: ${kauseId}\n\nKeep this ID safe! If you ever log out or use another device, you can use this ID to restore your Focus and Health analytics.`;
        window.electron.downloadRecoveryId(content);
      };

      return (
        <>
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Settings & Preferences</h2>
              <p className="text-sm text-gray-500 font-medium">Customize your focus sessions and health tracking.</p>
            </div>
            <button 
              onClick={handleSaveSettings}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md text-sm active:scale-95"
            >
              {saveSuccess ? 'Saved Successfully!' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Profile & Timers */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Profile</h3>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
                  <input 
                    type="text" 
                    value={settingsName} 
                    onChange={e => setSettingsName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-6">
                <h3 className="text-lg font-bold mb-4">Account Recovery</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Your data is tied to your Kause ID: <strong className="text-black">{kauseId}</strong>. Download this ID to keep it safe. You can use it to log in and restore your data if you switch accounts.
                </p>
                <button 
                  onClick={handleDownloadId}
                  className="w-full bg-black hover:bg-gray-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download Kause ID (.txt)
                </button>
              </div>
            </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Focus & Breaks</h3>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Focus Time</label>
                    <div className="flex flex-wrap gap-2">
                      {['5s', '10s', '5', '10', '15', '25', '50'].map(val => (
                        <button
                          key={val}
                          onClick={() => setSettingsWork(val)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${settingsWork === val ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {val.endsWith('s') ? val : `${val}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Break Time</label>
                    <div className="flex flex-wrap gap-2">
                      {['5s', '10s', '5', '10', '15', '25'].map(val => (
                        <button
                          key={val}
                          onClick={() => setSettingsBreak(val)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${settingsBreak === val ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {val.endsWith('s') ? val : `${val}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Tracking */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">Health Tracking</h3>
              <p className="text-xs text-gray-500 mb-6">Select the interval for local machine learning models to analyze your posture and blink rate.</p>
              
              <div className="flex flex-col gap-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    Eye Strain Analysis
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Off', '5s', '10s', '5', '10', '15', '20', '30'].map(val => (
                      <button
                        key={val}
                        onClick={() => setSettingsEye(val)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${settingsEye === val ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {val === 'Off' ? 'Off' : val.endsWith('s') ? val : `${val}m`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14"></path><path d="M5 12l7-7 7 7"></path></svg>
                    Posture Analysis
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Off', '5s', '10s', '5', '10', '15', '20', '30'].map(val => (
                      <button
                        key={val}
                        onClick={() => setSettingsPosture(val)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${settingsPosture === val ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {val === 'Off' ? 'Off' : val.endsWith('s') ? val : `${val}m`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="w-full h-screen min-w-[900px] min-h-[600px] bg-[#F8F9FA] text-[#111827] flex font-sans overflow-hidden rounded-xl border border-gray-200">
      
      {/* LEFT SIDEBAR */}
      <div 
        className="w-56 border-r border-gray-200 bg-white pt-4 pb-6 flex flex-col justify-between h-full shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10 relative"
      >
        <div className="absolute top-0 left-0 w-full h-12" style={{ WebkitAppRegion: 'drag' } as any}></div>

        <div className="relative z-20">
          <div className="flex gap-1.5 px-5 mb-6" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <button onClick={handleClose} className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] hover:bg-[#E0443E] transition-colors" />
            <button onClick={handleMinimize} className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] hover:bg-[#DEA125] transition-colors" />
            <button onClick={handleMaximize} className="w-2.5 h-2.5 rounded-full bg-[#27C93F] hover:bg-[#1AAB29] transition-colors" />
          </div>

          <div className="px-6 mb-8">
            <h1 className="text-xl font-black tracking-tight text-black">KAUSE</h1>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Health Concierge</p>
          </div>
          
          <nav className="flex flex-col gap-1.5 px-3" style={{ WebkitAppRegion: 'no-drag' } as any}>
            {[
              { id: 'Home', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path> },
              { id: 'Activity', icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline> },
              { id: 'Focus', icon: <><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></> },
              { id: 'Vision', icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></> },
              { id: 'Posture', icon: <><path d="M12 5v14"></path><path d="M5 12l7-7 7 7"></path></> },
              { id: 'Settings', icon: <><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.id 
                  ? 'bg-black text-white font-semibold shadow-md active:scale-95' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  {tab.id === 'Home' && <polyline points="9 22 9 12 15 12 15 22"></polyline>}
                  {tab.icon}
                </svg>
                {tab.id}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-3 flex flex-col gap-2 relative z-20" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <div className="flex flex-col gap-1 mt-2">
            <button 
              onClick={() => setActiveTab('Support')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === 'Support' ? 'bg-gray-100 text-black font-bold' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Support
            </button>
            <button 
              onClick={() => {
                if (window.electron?.resetApp) {
                  window.electron.resetApp();
                }
                localStorage.clear();
                window.electron?.closeAnalytics();
              }}
              className="flex items-center gap-3 text-[#FF5F56] hover:bg-red-50 px-4 py-2.5 rounded-full text-xs font-bold transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Switch Account
            </button>
            <button 
              onClick={() => {
                if (window.electron?.quitApp) {
                  window.electron.quitApp();
                }
              }}
              className="flex items-center gap-3 text-[#FF5F56] hover:bg-red-50 px-4 py-2.5 rounded-full text-xs font-bold transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
              Quit Kause
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 h-full overflow-y-auto relative bg-[#F8F9FA]">
        <div className="absolute top-0 left-0 w-full h-12" style={{ WebkitAppRegion: 'drag' } as any}></div>

        <div className="px-10 pt-12 pb-10 relative z-20" style={{ WebkitAppRegion: 'no-drag' } as any}>
          {updateReady && (
            <div className="mb-6 bg-blue-500 text-white px-6 py-4 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-between animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <div>
                  <h4 className="font-bold text-sm">Update Available</h4>
                  <p className="text-xs text-blue-100">A new version of Kause has been downloaded.</p>
                </div>
              </div>
              <button 
                onClick={() => window.electron?.installUpdate && window.electron.installUpdate()}
                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Restart & Install
              </button>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
