import { Clock } from 'lucide-react';

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value));
}

export default function ActivityTimeline({ activities }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="text-clinic-600" size={20} />
        <h2 className="text-lg font-bold">Activity Timeline</h2>
      </div>

      {!activities.length ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Queue actions will appear here as they happen.
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="border-l-2 border-clinic-500 pl-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.type}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{activity.message}</p>
              <p className="mt-1 text-xs text-slate-400">{formatTime(activity.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
