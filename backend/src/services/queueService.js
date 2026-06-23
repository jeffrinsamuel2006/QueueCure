import mongoose from 'mongoose';
import { Activity } from '../models/Activity.js';
import { Counter } from '../models/Counter.js';
import { Patient } from '../models/Patient.js';
import { Setting } from '../models/Setting.js';
import { memoryStore } from './memoryStore.js';

const ACTIVITY_TYPES = {
  PATIENT_ADDED: 'Patient Added',
  TOKEN_CALLED: 'Token Called',
  CONSULTATION_TIME_UPDATED: 'Consultation Time Updated',
  DOCTOR_STATUS_UPDATED: 'Doctor Status Updated',
  DEMO_QUEUE_GENERATED: 'Demo Queue Generated'
};

const DEMO_NAMES = [
  'Asha Patel',
  'Rahul Sharma',
  'Meera Nair',
  'Vikram Rao',
  'Ananya Singh',
  'Kabir Khan',
  'Priya Menon',
  'Arjun Mehta',
  'Neha Gupta',
  'Ishaan Das',
  'Sara Joseph',
  'Rohan Iyer',
  'Diya Kapoor',
  'Nikhil Verma',
  'Tara Shah',
  'Aditya Bose',
  'Kavya Reddy',
  'Maya Thomas',
  'Dev Malhotra',
  'Ira Chatterjee'
];

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

function cleanPatientName(patientName) {
  return String(patientName || '').trim().replace(/\s+/g, ' ');
}

function serializePatient(patient) {
  return {
    id: patient._id?.toString?.() || String(patient.tokenNumber),
    tokenNumber: patient.tokenNumber,
    patientName: patient.patientName,
    status: patient.status,
    createdAt: patient.createdAt,
    servedAt: patient.servedAt,
    consultationDurationMinutes: patient.consultationDurationMinutes ?? null
  };
}

function serializeActivity(activity) {
  return {
    id: activity._id?.toString?.() || String(activity.id),
    type: activity.type,
    message: activity.message,
    metadata: activity.metadata || {},
    createdAt: activity.createdAt
  };
}

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function getSettings() {
  if (!isMongoReady()) {
    return {
      averageConsultationTime: memoryStore.state.averageConsultationTime,
      doctorStatus: memoryStore.state.doctorStatus
    };
  }

  const settings = await Setting.findOneAndUpdate(
    { key: 'clinic' },
    { $setOnInsert: { key: 'clinic', averageConsultationTime: 8, doctorStatus: 'available' } },
    { new: true, upsert: true }
  );

  return {
    averageConsultationTime: settings.averageConsultationTime,
    doctorStatus: settings.doctorStatus
  };
}

async function getPatients() {
  if (!isMongoReady()) {
    return [...memoryStore.state.patients].map(serializePatient);
  }

  const patients = await Patient.find().sort({ tokenNumber: 1 }).lean();
  return patients.map(serializePatient);
}

async function getPatientDocuments() {
  if (!isMongoReady()) {
    return [...memoryStore.state.patients].map(serializePatient);
  }

  const patients = await Patient.find().sort({ tokenNumber: 1 }).lean();
  return patients.map(serializePatient);
}

async function recordActivity(type, message, metadata = {}) {
  if (!isMongoReady()) {
    const activity = {
      id: memoryStore.state.nextActivityId++,
      type,
      message,
      metadata,
      createdAt: new Date()
    };
    memoryStore.state.activities.unshift(activity);
    memoryStore.state.activities = memoryStore.state.activities.slice(0, 100);
    return serializeActivity(activity);
  }

  const activity = await Activity.create({ type, message, metadata });
  return serializeActivity(activity);
}

function buildStatus(patients, settings) {
  const serving = patients.find((patient) => patient.status === 'serving');
  const waiting = patients.filter((patient) => patient.status === 'waiting');
  const served = patients.filter((patient) => patient.status === 'served');
  const currentToken = serving?.tokenNumber || 0;
  const totalHistoricalDuration = served.reduce(
    (sum, patient) => sum + (patient.consultationDurationMinutes || settings.averageConsultationTime),
    0
  );
  const adaptiveConsultationTime =
    served.length > 0 ? Math.max(1, Math.round(totalHistoricalDuration / served.length)) : settings.averageConsultationTime;

  return {
    currentToken,
    currentPatient: serving || null,
    waitingPatients: waiting,
    servedPatients: served,
    totalWaiting: waiting.length,
    averageConsultationTime: settings.averageConsultationTime,
    adaptiveConsultationTime,
    doctorStatus: settings.doctorStatus,
    lastUpdated: new Date().toISOString()
  };
}

export async function getQueueStatus() {
  const [patients, settings] = await Promise.all([getPatients(), getSettings()]);
  return buildStatus(patients, settings);
}

export async function getRecentActivities(limit = 20) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 20);

  if (!isMongoReady()) {
    return memoryStore.state.activities.slice(0, safeLimit).map(serializeActivity);
  }

  const activities = await Activity.find().sort({ createdAt: -1 }).limit(safeLimit).lean();
  return activities.map(serializeActivity);
}

export async function addPatient(patientName) {
  const name = cleanPatientName(patientName);
  if (!name) {
    const error = new Error('Patient name is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!isMongoReady()) {
    const patient = {
      tokenNumber: memoryStore.state.nextToken++,
      patientName: name,
      status: 'waiting',
      createdAt: new Date(),
      servedAt: null,
      consultationDurationMinutes: null
    };
    memoryStore.state.patients.push(patient);
    const serializedPatient = serializePatient(patient);
    const activity = await recordActivity(ACTIVITY_TYPES.PATIENT_ADDED, `Token ${patient.tokenNumber} created for ${name}.`, {
      tokenNumber: patient.tokenNumber,
      patientName: name
    });
    return { patient: serializedPatient, queue: await getQueueStatus(), activity };
  }

  const counter = await Counter.findOneAndUpdate(
    { key: 'patientToken' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  const tokenNumber = counter.value;
  const patient = await Patient.create({ tokenNumber, patientName: name });
  const activity = await recordActivity(ACTIVITY_TYPES.PATIENT_ADDED, `Token ${tokenNumber} created for ${name}.`, {
    tokenNumber,
    patientName: name
  });
  return { patient: serializePatient(patient), queue: await getQueueStatus(), activity };
}

export async function callNextToken() {
  if (!isMongoReady()) {
    const serving = memoryStore.state.patients.find((patient) => patient.status === 'serving');
    if (serving) {
      serving.status = 'served';
      serving.servedAt = new Date();
      serving.consultationDurationMinutes = Math.max(
        1,
        Math.round((serving.servedAt - serving.createdAt) / 60000)
      );
    }

    const next = memoryStore.state.patients.find((patient) => patient.status === 'waiting');
    if (!next) {
      const error = new Error('Queue is empty.');
      error.statusCode = 409;
      throw error;
    }
    next.status = 'serving';
    const activity = await recordActivity(ACTIVITY_TYPES.TOKEN_CALLED, `Token ${next.tokenNumber} called for ${next.patientName}.`, {
      tokenNumber: next.tokenNumber,
      patientName: next.patientName
    });
    return { patient: serializePatient(next), queue: await getQueueStatus(), activity };
  }

  const session = await mongoose.startSession();
  try {
    let calledPatient = null;
    await session.withTransaction(async () => {
      const serving = await Patient.findOne({ status: 'serving' }).session(session);
      if (serving) {
        const duration = Math.max(1, Math.round((Date.now() - serving.createdAt.getTime()) / 60000));
        serving.status = 'served';
        serving.servedAt = new Date();
        serving.consultationDurationMinutes = duration;
        await serving.save({ session });
      }

      calledPatient = await Patient.findOneAndUpdate(
        { status: 'waiting' },
        { status: 'serving' },
        { sort: { tokenNumber: 1 }, new: true, session }
      );

      if (!calledPatient) {
        const error = new Error('Queue is empty.');
        error.statusCode = 409;
        throw error;
      }
    });

    const activity = await recordActivity(
      ACTIVITY_TYPES.TOKEN_CALLED,
      `Token ${calledPatient.tokenNumber} called for ${calledPatient.patientName}.`,
      {
        tokenNumber: calledPatient.tokenNumber,
        patientName: calledPatient.patientName
      }
    );
    return { patient: serializePatient(calledPatient), queue: await getQueueStatus(), activity };
  } finally {
    await session.endSession();
  }
}

export async function updateConsultationTime(minutes) {
  const averageConsultationTime = Number(minutes);
  if (!Number.isFinite(averageConsultationTime) || averageConsultationTime < 1 || averageConsultationTime > 120) {
    const error = new Error('Average consultation time must be between 1 and 120 minutes.');
    error.statusCode = 400;
    throw error;
  }

  if (!isMongoReady()) {
    memoryStore.state.averageConsultationTime = Math.round(averageConsultationTime);
    const queue = await getQueueStatus();
    const activity = await recordActivity(
      ACTIVITY_TYPES.CONSULTATION_TIME_UPDATED,
      `Average consultation time updated to ${queue.averageConsultationTime} minutes.`,
      { minutes: queue.averageConsultationTime }
    );
    return { ...queue, activity };
  }

  await Setting.findOneAndUpdate(
    { key: 'clinic' },
    {
      key: 'clinic',
      averageConsultationTime: Math.round(averageConsultationTime),
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  const queue = await getQueueStatus();
  const activity = await recordActivity(
    ACTIVITY_TYPES.CONSULTATION_TIME_UPDATED,
    `Average consultation time updated to ${queue.averageConsultationTime} minutes.`,
    { minutes: queue.averageConsultationTime }
  );
  return { ...queue, activity };
}

export async function updateDoctorStatus(status) {
  if (!['available', 'busy', 'break'].includes(status)) {
    const error = new Error('Doctor status must be available, busy, or break.');
    error.statusCode = 400;
    throw error;
  }

  if (!isMongoReady()) {
    memoryStore.state.doctorStatus = status;
    const queue = await getQueueStatus();
    const activity = await recordActivity(ACTIVITY_TYPES.DOCTOR_STATUS_UPDATED, `Doctor status changed to ${status}.`, {
      status
    });
    return { ...queue, activity };
  }

  await Setting.findOneAndUpdate(
    { key: 'clinic' },
    { key: 'clinic', doctorStatus: status, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  const queue = await getQueueStatus();
  const activity = await recordActivity(ACTIVITY_TYPES.DOCTOR_STATUS_UPDATED, `Doctor status changed to ${status}.`, {
    status
  });
  return { ...queue, activity };
}

export async function getStatistics() {
  const queue = await getQueueStatus();
  const totalServed = queue.servedPatients.length;
  const averageWaitingTime =
    totalServed === 0
      ? 0
      : Math.round(
          queue.servedPatients.reduce((sum, patient) => {
            const created = new Date(patient.createdAt).getTime();
            const served = new Date(patient.servedAt).getTime();
            return sum + Math.max(0, served - created) / 60000;
          }, 0) / totalServed
        );

  return {
    totalPatientsServed: totalServed,
    averageWaitingTime,
    queueLength: queue.totalWaiting,
    adaptiveConsultationTime: queue.adaptiveConsultationTime
  };
}

export async function getAnalytics() {
  const patients = await getPatientDocuments();
  const queue = await getQueueStatus();
  const servedPatients = patients.filter((patient) => patient.status === 'served');
  const servedWaits = servedPatients
    .filter((patient) => patient.createdAt && patient.servedAt)
    .map((patient) => Math.max(0, (new Date(patient.servedAt).getTime() - new Date(patient.createdAt).getTime()) / 60000));
  const consultationDurations = servedPatients
    .map((patient) => patient.consultationDurationMinutes)
    .filter((minutes) => Number.isFinite(minutes));
  const average = (values) => (values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0);

  return {
    patientsServed: servedPatients.length,
    queueLength: queue.totalWaiting,
    averageConsultationDuration: average(consultationDurations),
    waitTimeStatistics: {
      average: average(servedWaits),
      minimum: servedWaits.length ? Math.round(Math.min(...servedWaits)) : 0,
      maximum: servedWaits.length ? Math.round(Math.max(...servedWaits)) : 0
    },
    statusBreakdown: [
      { name: 'Waiting', value: patients.filter((patient) => patient.status === 'waiting').length },
      { name: 'Serving', value: patients.filter((patient) => patient.status === 'serving').length },
      { name: 'Served', value: servedPatients.length }
    ],
    consultationDurations: servedPatients.slice(-10).map((patient) => ({
      tokenNumber: patient.tokenNumber,
      duration: patient.consultationDurationMinutes || 0
    }))
  };
}

export async function generateDemoQueue() {
  const count = 10 + Math.floor(Math.random() * 11);
  const selectedNames = [...DEMO_NAMES].sort(() => Math.random() - 0.5).slice(0, count);
  const createdPatients = [];

  if (!isMongoReady()) {
    for (const name of selectedNames) {
      const patient = {
        tokenNumber: memoryStore.state.nextToken++,
        patientName: name,
        status: 'waiting',
        createdAt: new Date(Date.now() - createdPatients.length * 4 * 60000),
        servedAt: null,
        consultationDurationMinutes: null
      };
      memoryStore.state.patients.push(patient);
      createdPatients.push(serializePatient(patient));
    }
  } else {
    for (const name of selectedNames) {
      const counter = await Counter.findOneAndUpdate(
        { key: 'patientToken' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      const patient = await Patient.create({
        tokenNumber: counter.value,
        patientName: name,
        createdAt: new Date(Date.now() - createdPatients.length * 4 * 60000)
      });
      createdPatients.push(serializePatient(patient));
    }
  }

  const activity = await recordActivity(
    ACTIVITY_TYPES.DEMO_QUEUE_GENERATED,
    `${createdPatients.length} demo patients added to the queue.`,
    { count: createdPatients.length }
  );

  return { patients: createdPatients, queue: await getQueueStatus(), activity };
}

export async function exportPatientsCsv() {
  const patients = await getPatientDocuments();
  const rows = [
    ['Token Number', 'Patient Name', 'Arrival Time', 'Served Time', 'Consultation Duration'],
    ...patients.map((patient) => [
      patient.tokenNumber,
      patient.patientName,
      patient.createdAt ? new Date(patient.createdAt).toISOString() : '',
      patient.servedAt ? new Date(patient.servedAt).toISOString() : '',
      patient.consultationDurationMinutes ?? ''
    ])
  ];

  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
}
