import { useState } from 'react';
import { Activity, Clock, Megaphone, Save, Sparkles, UserPlus } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import ActivityTimeline from '../components/ActivityTimeline';
import QueueList from '../components/QueueList';
import StatCard from '../components/StatCard';
import { addPatient, callNextToken, generateDemoQueue, saveConsultationTime, saveDoctorStatus } from '../services/api';

function announceToken(tokenNumber) {
  if (!('speechSynthesis' in window)) return;
  const message = new SpeechSynthesisUtterance(`Token ${tokenNumber}, please proceed to consultation room.`);
  message.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(message);
}

export default function ReceptionistDashboard() {
  const { queue, statistics, activities, loading, error, setError } = useOutletContext();
  const [patientName, setPatientName] = useState('');
  const [minutes, setMinutes] = useState(queue.averageConsultationTime);
  const [saving, setSaving] = useState(false);

  async function submitPatient(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await addPatient(patientName);
      toast.success('Patient added');
      setPatientName('');
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not add patient.';
      toast.error(message);
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCallNext() {
    if (!queue.totalWaiting) return;
    const confirmed = window.confirm('Call the next waiting patient now?');
    if (!confirmed) return;

    setSaving(true);
    try {
      const result = await callNextToken();
      announceToken(result.patient.tokenNumber);
      toast.success(`Token ${result.patient.tokenNumber} called`);
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not call next token.';
      toast.error(message === 'Queue is empty.' ? 'Queue empty' : message);
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveMinutes(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveConsultationTime(minutes);
      toast.success('Settings updated');
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not save consultation time.';
      toast.error(message);
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDoctorStatus(status) {
    try {
      await saveDoctorStatus(status);
      toast.success('Settings updated');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not update doctor status.';
      toast.error(message);
      setError(message);
    }
  }

  async function handleGenerateDemoQueue() {
    setSaving(true);
    try {
      const result = await generateDemoQueue();
      toast.success(`${result.patients.length} demo patients added`);
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not generate demo queue.';
      toast.error(message);
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-20 text-center text-slate-500">Loading live queue...</p>;
  }

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Current Token" value={queue.currentToken || '-'} helper={queue.currentPatient?.patientName || 'No active consultation'} />
        <StatCard label="Waiting Patients" value={queue.totalWaiting} helper="Live queue length" />
        <StatCard label="Avg Time" value={`${queue.averageConsultationTime}m`} helper="Manual clinic setting" />
        <StatCard label="AI Estimate" value={`${queue.adaptiveConsultationTime}m`} helper="Based on served history" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <form onSubmit={submitPatient} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="text-clinic-600" size={20} />
              <h2 className="text-lg font-bold">Patient Registration</h2>
            </div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="patientName">
              Patient Name
            </label>
            <input
              id="patientName"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-clinic-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              placeholder="Enter patient name"
            />
            <button disabled={saving || !patientName.trim()} className="mt-4 w-full rounded-md bg-clinic-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
              Add Patient
            </button>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="text-clinic-600" size={20} />
              <h2 className="text-lg font-bold">Consultation Settings</h2>
            </div>
            <form onSubmit={handleSaveMinutes} className="flex gap-3">
              <input
                type="number"
                min="1"
                max="120"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-clinic-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
              />
              <button className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-3 font-bold text-white dark:bg-white dark:text-slate-950">
                <Save size={17} /> Save
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="text-clinic-600" size={20} />
              <h2 className="text-lg font-bold">Doctor Availability</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['available', 'busy', 'break'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleDoctorStatus(status)}
                  className={`rounded-md px-3 py-2 text-sm font-bold capitalize ${queue.doctorStatus === status ? 'bg-clinic-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={saving}
            onClick={handleGenerateDemoQueue}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            <Sparkles size={18} /> Generate Demo Queue
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Queue Control</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Current: {queue.currentPatient?.patientName || 'No patient being served'}</p>
              </div>
              <button
                disabled={!queue.totalWaiting || saving}
                onClick={handleCallNext}
                className="inline-flex items-center gap-2 rounded-md bg-clinic-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Megaphone size={18} /> Call Next
              </button>
            </div>
          </div>

          <QueueList patients={queue.waitingPatients} />

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label="Served" value={statistics.totalPatientsServed} />
            <StatCard label="Avg Wait" value={`${statistics.averageWaitingTime}m`} />
            <StatCard label="Queue Length" value={statistics.queueLength} />
          </section>

          <ActivityTimeline activities={activities} />
        </div>
      </section>
    </div>
  );
}
