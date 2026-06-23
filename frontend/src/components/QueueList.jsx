export default function QueueList({ patients }) {
  if (!patients.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        No patients are waiting right now.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {patients.map((patient) => (
        <div key={patient.tokenNumber} className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{patient.patientName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Token {patient.tokenNumber}</p>
          </div>
          <span className="rounded-full bg-clinic-50 px-3 py-1 text-xs font-bold text-clinic-600 dark:bg-clinic-900 dark:text-clinic-100">
            Waiting
          </span>
        </div>
      ))}
    </div>
  );
}
