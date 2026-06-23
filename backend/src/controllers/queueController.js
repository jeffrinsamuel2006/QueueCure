import {
  addPatient,
  callNextToken,
  exportPatientsCsv,
  generateDemoQueue,
  getAnalytics,
  getRecentActivities,
  getQueueStatus,
  getStatistics,
  updateConsultationTime,
  updateDoctorStatus
} from '../services/queueService.js';
import { emitQueueEvent } from '../socket/socket.js';
import { SOCKET_EVENTS } from '../socket/events.js';

export async function handleAddPatient(req, res, next) {
  try {
    const result = await addPatient(req.body.patientName);
    emitQueueEvent(SOCKET_EVENTS.PATIENT_ADDED, result);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function handleGetQueueStatus(_req, res, next) {
  try {
    res.json({ success: true, data: await getQueueStatus() });
  } catch (error) {
    next(error);
  }
}

export async function handleCallNextToken(_req, res, next) {
  try {
    const result = await callNextToken();
    emitQueueEvent(SOCKET_EVENTS.TOKEN_CALLED, result);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateConsultationTime(req, res, next) {
  try {
    const queue = await updateConsultationTime(req.body.minutes);
    emitQueueEvent(SOCKET_EVENTS.CONSULTATION_TIME_UPDATED, queue);
    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateDoctorStatus(req, res, next) {
  try {
    const queue = await updateDoctorStatus(req.body.status);
    emitQueueEvent(SOCKET_EVENTS.DOCTOR_STATUS_UPDATED, queue);
    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
}

export async function handleGetStatistics(_req, res, next) {
  try {
    res.json({ success: true, data: await getStatistics() });
  } catch (error) {
    next(error);
  }
}

export async function handleGetActivities(_req, res, next) {
  try {
    res.json({ success: true, data: await getRecentActivities() });
  } catch (error) {
    next(error);
  }
}

export async function handleGenerateDemoQueue(_req, res, next) {
  try {
    const result = await generateDemoQueue();
    emitQueueEvent(SOCKET_EVENTS.DEMO_QUEUE_GENERATED, result);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function handleGetAnalytics(_req, res, next) {
  try {
    res.json({ success: true, data: await getAnalytics() });
  } catch (error) {
    next(error);
  }
}

export async function handleExportPatientsCsv(_req, res, next) {
  try {
    const csv = await exportPatientsCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment(`queue-cure-report-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
}
