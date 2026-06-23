import { Maximize2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

function formatClock(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

export default function LiveQueueBoard() {
  const { queue, loading } = useOutletContext();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  }

  if (loading) {
    return <p className="py-20 text-center text-slate-500">Loading live board...</p>;
  }

  const nextPatients = queue.waitingPatients.slice(0, 5);

  return (
    <div className="min-h-[calc(100vh-120px)] space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Live Queue Board</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Waiting-room display</p>
        </div>
        <button onClick={enterFullscreen} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-3 font-bold text-white dark:bg-white dark:text-slate-950">
          <Maximize2 size={18} /> Full Screen
        </button>
      </div>

      <section className="rounded-lg bg-clinic-600 p-8 text-white shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-clinic-100">Now Serving</p>
            <p className="mt-4 text-8xl font-black leading-none">{queue.currentToken || '-'}</p>
            <p className="mt-4 text-2xl font-bold text-clinic-50">{queue.currentPatient?.patientName || 'Waiting for next token'}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black">{formatClock(now)}</p>
            <p className="mt-3 rounded-full bg-white/15 px-4 py-2 text-sm font-bold capitalize">Doctor: {queue.doctorStatus}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        {nextPatients.length ? (
          nextPatients.map((patient) => (
            <div key={patient.tokenNumber} className="rounded-lg border border-slate-200 bg-white p-5 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Next</p>
              <p className="mt-2 text-4xl font-black text-slate-950 dark:text-white">{patient.tokenNumber}</p>
              <p className="mt-2 truncate text-sm text-slate-600 dark:text-slate-300">{patient.patientName}</p>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-5">
            No waiting patients.
          </div>
        )}
      </section>
    </div>
  );
}
