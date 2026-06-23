import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchActivities, fetchQueue, fetchStatistics } from '../services/api';
import { socket } from '../services/socket';

const initialQueue = {
  currentToken: 0,
  currentPatient: null,
  waitingPatients: [],
  servedPatients: [],
  totalWaiting: 0,
  averageConsultationTime: 8,
  adaptiveConsultationTime: 8,
  doctorStatus: 'available',
  lastUpdated: new Date().toISOString()
};

export function useQueue() {
  const [queue, setQueue] = useState(initialQueue);
  const [statistics, setStatistics] = useState({
    totalPatientsServed: 0,
    averageWaitingTime: 0,
    queueLength: 0,
    adaptiveConsultationTime: 8
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(socket.connected);
  const [activities, setActivities] = useState([]);
  const sawDisconnect = useRef(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [queueData, statsData, activityData] = await Promise.all([fetchQueue(), fetchStatistics(), fetchActivities()]);
        if (!active) return;
        setQueue(queueData);
        setStatistics(statsData);
        setActivities(activityData);
        setError('');
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Unable to load queue data.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    const onQueueUpdated = async (data) => {
      setQueue(data);
      try {
        setStatistics(await fetchStatistics());
      } catch {
        // Statistics are helpful but should not break the live queue display.
      }
    };

    const onConnect = () => {
      setConnected(true);
      if (sawDisconnect.current) {
        toast.success('Connection restored');
      }
    };
    const onDisconnect = () => {
      sawDisconnect.current = true;
      setConnected(false);
      toast.warning('Connection lost');
    };
    const onActivityCreated = (activity) => {
      setActivities((current) => [activity, ...current].slice(0, 20));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('queueUpdated', onQueueUpdated);
    socket.on('patientAdded', ({ queue: nextQueue }) => nextQueue && onQueueUpdated(nextQueue));
    socket.on('tokenCalled', ({ queue: nextQueue }) => nextQueue && onQueueUpdated(nextQueue));
    socket.on('consultationTimeUpdated', onQueueUpdated);
    socket.on('doctorStatusUpdated', onQueueUpdated);
    socket.on('demoQueueGenerated', ({ queue: nextQueue }) => nextQueue && onQueueUpdated(nextQueue));
    socket.on('activityCreated', onActivityCreated);

    return () => {
      active = false;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queueUpdated', onQueueUpdated);
      socket.off('patientAdded');
      socket.off('tokenCalled');
      socket.off('consultationTimeUpdated', onQueueUpdated);
      socket.off('doctorStatusUpdated', onQueueUpdated);
      socket.off('demoQueueGenerated');
      socket.off('activityCreated', onActivityCreated);
    };
  }, []);

  return useMemo(
    () => ({ queue, statistics, activities, loading, error, connected, setError }),
    [queue, statistics, activities, loading, error, connected]
  );
}
