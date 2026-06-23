import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import StatCard from '../components/StatCard';

export default function PatientDashboard() {
  const { queue, loading, error } = useOutletContext();
  const [myToken, setMyToken] = useState('');

  const patientView = useMemo(() => {
    const token = Number(myToken);
    const current = queue.currentToken || 0;
    if (!Number.isFinite(token) || token <= 0) {
      return { patientsAhead: 0, estimatedWait: 0, status: 'Enter your token to track your queue position.' };
    }

    const waitingTokenNumbers = queue.waitingPatients.map((patient) => patient.tokenNumber);
    const isWaiting = waitingTokenNumbers.includes(token);
    const isCurrent = token === current;
    const patientsAhead = isWaiting
      ? queue.waitingPatients.filter((patient) => patient.tokenNumber < token).length + (current ? 1 : 0)
      : Math.max(0, token - current);
    const estimatedWait = patientsAhead * queue.adaptiveConsultationTime;

    if (isCurrent) return { patientsAhead: 0, estimatedWait: 0, status: 'It is your turn now.' };
    if (isWaiting) return { patientsAhead, estimatedWait, status: 'You are in the waiting queue.' };
    if (current && token < current) return { patientsAhead: 0, estimatedWait: 0, status: 'This token was already called.' };
    return { patientsAhead, estimatedWait, status: 'Token not found yet. Please check the number on your slip.' };
  }, [myToken, queue]);

  if (loading) {
    return <p className="py-20 text-center text-slate-500">Loading live patient board...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div> : null}

      <section className="rounded-lg bg-clinic-600 p-6 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-clinic-100">Now Serving</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-6xl font-black">{queue.currentToken || '-'}</p>
            <p className="mt-2 text-clinic-50">{queue.currentPatient?.patientName || 'Please wait for the first token call.'}</p>
          </div>
          <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold capitalize">Doctor: {queue.doctorStatus}</span>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="myToken">
          Enter Your Token
        </label>
        <input
          id="myToken"
          type="number"
          min="1"
          value={myToken}
          onChange={(event) => setMyToken(event.target.value)}
          placeholder="Example: 18"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-4 text-lg outline-none ring-clinic-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
        />
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{patientView.status}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Current Token" value={queue.currentToken || '-'} />
        <StatCard label="My Token" value={myToken || '-'} />
        <StatCard label="Patients Ahead" value={patientView.patientsAhead} />
        <StatCard label="Estimated Wait" value={`${patientView.estimatedWait}m`} helper="Adaptive estimate" />
      </section>

      {!queue.totalWaiting && !queue.currentToken ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          The clinic queue is empty. New tokens will appear here instantly.
        </div>
      ) : null}
    </div>
  );
}
