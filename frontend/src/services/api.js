import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000
});

export async function fetchQueue() {
  const response = await api.get('/queue');
  return response.data.data;
}

export async function addPatient(patientName) {
  const response = await api.post('/patients', { patientName });
  return response.data.data;
}

export async function callNextToken() {
  const response = await api.post('/queue/call-next');
  return response.data.data;
}

export async function saveConsultationTime(minutes) {
  const response = await api.post('/settings/consultation-time', { minutes });
  return response.data.data;
}

export async function saveDoctorStatus(status) {
  const response = await api.post('/settings/doctor-status', { status });
  return response.data.data;
}

export async function fetchStatistics() {
  const response = await api.get('/statistics');
  return response.data.data;
}

export async function fetchActivities() {
  const response = await api.get('/activities');
  return response.data.data;
}

export async function generateDemoQueue() {
  const response = await api.post('/demo/generate');
  return response.data.data;
}

export async function fetchAnalytics() {
  const response = await api.get('/analytics');
  return response.data.data;
}

export async function exportPatientsReport() {
  const response = await api.get('/reports/patients.csv', { responseType: 'blob' });
  return response.data;
}
