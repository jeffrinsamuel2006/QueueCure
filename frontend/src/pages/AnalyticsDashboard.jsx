import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatCard from '../components/StatCard';
import { exportPatientsReport, fetchAnalytics } from '../services/api';
import { socket } from '../services/socket';

const COLORS = ['#14b8a6', '#0f172a', '#64748b'];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    try {
      setAnalytics(await fetchAnalytics());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
    socket.on('queueUpdated', loadAnalytics);
    return () => socket.off('queueUpdated', loadAnalytics);
  }, []);

  async function handleExport() {
    try {
      const blob = await exportPatientsReport();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `queue-cure-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not export report.');
    }
  }

  if (loading || !analytics) {
    return <p className="py-20 text-center text-slate-500">Loading analytics...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Live operational queue metrics</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-md bg-clinic-600 px-4 py-3 font-bold text-white">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Patients Served" value={analytics.patientsServed} />
        <StatCard label="Queue Length" value={analytics.queueLength} />
        <StatCard label="Avg Consultation" value={`${analytics.averageConsultationDuration}m`} />
        <StatCard label="Avg Wait" value={`${analytics.waitTimeStatistics.average}m`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-bold">Consultation Duration</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.consultationDurations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tokenNumber" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-bold">Queue Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.statusBreakdown} dataKey="value" nameKey="name" outerRadius={100} label>
                  {analytics.statusBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Minimum Wait" value={`${analytics.waitTimeStatistics.minimum}m`} />
        <StatCard label="Maximum Wait" value={`${analytics.waitTimeStatistics.maximum}m`} />
        <StatCard label="Average Wait" value={`${analytics.waitTimeStatistics.average}m`} />
      </section>
    </div>
  );
}
