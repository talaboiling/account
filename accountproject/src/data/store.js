// src/data/store.js
//
// Pure presentation metadata for application/tour statuses (labels, colors,
// step numbers for the StepTracker). The actual data now lives in the
// backend database — see src/context/StoreContext.js and server/.

// Steps 1–9 are GROUP (tour-level). Steps 10–12 are INDIVIDUAL per application.
export const APPLICATION_STATUSES = {
  submitted: { label: 'Подана', color: 'yellow', step: 1 },
  accepted: { label: 'Принята', color: 'blue', step: 2 },
  draft_sent: { label: 'Драфт договора отправлен', color: 'cyan', step: 3 },
  signed: { label: 'Договор подписан', color: 'purple', step: 4 },
  active: { label: 'В действии', color: 'green', step: 5 },
  in_progress: { label: 'В работе', color: 'blue', step: 6 },
  completed: { label: 'Работа завершена', color: 'purple', step: 7 },
  samples_sent: { label: 'Образцы отправлены', color: 'cyan', step: 8 },
  samples_received: { label: 'Образцы приняты', color: 'blue', step: 9 },
  // ↓ Individual from here
  protocol_uploaded: { label: 'Протокол прикреплён', color: 'purple', step: 10 },
  processing: { label: 'Обработка протокола', color: 'yellow', step: 11 },
  finished: { label: 'Завершено', color: 'green', step: 12 },
  rejected: { label: 'Отклонена', color: 'red', step: 0 },
};

export const TOUR_STATUSES = {
  forming: { label: 'Набор участников', color: 'yellow' },
  active: { label: 'Тур запущен', color: 'blue' },
  in_progress: { label: 'В работе', color: 'cyan' },
  completed: { label: 'Работа завершена', color: 'purple' },
  samples_sent: { label: 'Образцы отправлены', color: 'green' },
  finished: { label: 'Тур завершён', color: 'green' },
};
