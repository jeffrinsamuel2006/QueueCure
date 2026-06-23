import assert from 'node:assert/strict';
import test from 'node:test';
import { addPatient, callNextToken, getQueueStatus, updateConsultationTime } from '../src/services/queueService.js';
import { memoryStore } from '../src/services/memoryStore.js';

test('adds patients with automatic token numbers', async () => {
  memoryStore.reset();
  const first = await addPatient('Asha');
  const second = await addPatient('Asha');

  assert.equal(first.patient.tokenNumber, 1);
  assert.equal(second.patient.tokenNumber, 2);
  assert.equal(first.patient.patientName, 'Asha');
});

test('prevents call-next when queue is empty', async () => {
  memoryStore.reset();
  await assert.rejects(() => callNextToken(), /Queue is empty/);
});

test('updates consultation time and queue status', async () => {
  memoryStore.reset();
  await updateConsultationTime(12);
  const queue = await getQueueStatus();

  assert.equal(queue.averageConsultationTime, 12);
});
