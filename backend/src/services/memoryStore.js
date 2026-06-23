const state = {
  nextToken: 1,
  nextActivityId: 1,
  averageConsultationTime: 8,
  doctorStatus: 'available',
  patients: [],
  activities: []
};

export const memoryStore = {
  state,
  reset() {
    state.nextToken = 1;
    state.nextActivityId = 1;
    state.averageConsultationTime = 8;
    state.doctorStatus = 'available';
    state.patients = [];
    state.activities = [];
  }
};
