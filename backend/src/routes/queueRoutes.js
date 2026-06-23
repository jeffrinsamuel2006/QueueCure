import express from 'express';
import {
  handleAddPatient,
  handleCallNextToken,
  handleExportPatientsCsv,
  handleGenerateDemoQueue,
  handleGetActivities,
  handleGetAnalytics,
  handleGetQueueStatus,
  handleGetStatistics,
  handleUpdateConsultationTime,
  handleUpdateDoctorStatus
} from '../controllers/queueController.js';

export const queueRouter = express.Router();

queueRouter.post('/patients', handleAddPatient);
queueRouter.get('/queue', handleGetQueueStatus);
queueRouter.post('/queue/call-next', handleCallNextToken);
queueRouter.post('/settings/consultation-time', handleUpdateConsultationTime);
queueRouter.post('/settings/doctor-status', handleUpdateDoctorStatus);
queueRouter.get('/statistics', handleGetStatistics);
queueRouter.get('/activities', handleGetActivities);
queueRouter.post('/demo/generate', handleGenerateDemoQueue);
queueRouter.get('/analytics', handleGetAnalytics);
queueRouter.get('/reports/patients.csv', handleExportPatientsCsv);
