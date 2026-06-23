import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from '../components/Header';
import { useQueue } from '../hooks/useQueue';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const queueState = useQueue();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} connected={queueState.connected} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet context={queueState} />
      </main>
      <ToastContainer position="top-right" theme={darkMode ? 'dark' : 'light'} />
    </div>
  );
}
