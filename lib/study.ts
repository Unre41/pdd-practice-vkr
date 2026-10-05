import type { TrainingAction } from './learning-game.ts';
import { questions, type Question, type QuestionMode } from './questions.ts';

export type StudyQuestionSets = {
  pretest: Question[];
  training: Question[];
  posttest: Question[];
};

const modes: QuestionMode[] = ['signs', 'signals', 'priority'];

function shuffle<T>(items: T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createStudyQuestionSets(random: () => number = Math.random): StudyQuestionSets {
  const sets: StudyQuestionSets = { pretest: [], training: [], posttest: [] };

  for (const mode of modes) {
    const pool = shuffle(questions.filter((question) => question.mode === mode), random);
    if (pool.length < 8) throw new Error(`Для темы ${mode} требуется минимум 8 вопросов`);
    sets.pretest.push(...pool.slice(0, 2));
    sets.training.push(...pool.slice(2, 6));
    sets.posttest.push(...pool.slice(6, 8));
  }

  return {
    pretest: shuffle(sets.pretest, random),
    // The questions are random inside each topic block. Keeping the blocks
    // contiguous preserves the topic navigation in the training interface.
    training: sets.training,
    posttest: shuffle(sets.posttest, random),
  };
}

export const surveyStatements = [
  { id: 'clarity', label: 'Формулировки заданий были понятными' },
  { id: 'feedback', label: 'Объяснения помогали разобраться в правилах' },
  { id: 'engagement', label: 'Игровой формат удерживал моё внимание' },
  { id: 'usability', label: 'Мне было удобно управлять игровыми заданиями' },
  { id: 'satisfaction', label: 'В целом я доволен прохождением учебной игры' },
] as const;

export type SurveyId = (typeof surveyStatements)[number]['id'];

export const badgeCatalog = {
  'first-correct': { title: 'Первый верный', description: 'Дан первый правильный ответ' },
  'hot-streak': { title: 'Серия ×3', description: 'Три правильных ответа подряд' },
  'road-expert': { title: 'Знаток дорог', description: 'Не менее 10 правильных ответов' },
  'perfect-route': { title: 'Идеальный маршрут', description: 'Все учебные задания решены верно' },
} as const;

export type BadgeId = keyof typeof badgeCatalog;

export type TrainingGameSummary = {
  xp: number;
  level: number;
  maxStreak: number;
  heartsLeft: number;
  unlockedBadges: BadgeId[];
};

export type StudyResult = {
  participantCode: string;
  questionBankVersion?: string;
  protocolVersion?: string;
  priorExposure?: 'yes' | 'no' | 'unknown';
  trainingActions?: TrainingAction[];
  preQuestionIds: string[];
  trainingQuestionIds: string[];
  postQuestionIds: string[];
  preAnswers?: number[];
  trainingAnswers?: number[];
  postAnswers?: number[];
  preTopicScores?: Record<QuestionMode, number>;
  trainingTopicScores?: Record<QuestionMode, number>;
  postTopicScores?: Record<QuestionMode, number>;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  preScore: number;
  preTotal: number;
  trainingScore: number;
  trainingTotal: number;
  trainingXp: number;
  trainingLevel: number;
  maxStreak: number;
  heartsLeft: number;
  unlockedBadges: BadgeId[];
  postScore: number;
  postTotal: number;
  survey: Record<SurveyId, number>;
};

const STORAGE_KEY = 'pdd-practice-study-results-v1';
const RESULTS_CHANGED_EVENT = 'pdd-practice-results-changed';

function readResults(): StudyResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const value: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(value)) return [];
    return value.filter((record): record is StudyResult => record !== null && typeof record === 'object'
      && typeof record.participantCode === 'string' && typeof record.preScore === 'number'
      && typeof record.postScore === 'number' && Array.isArray(record.preQuestionIds)
      && Array.isArray(record.trainingQuestionIds) && Array.isArray(record.postQuestionIds)
      && record.survey !== null && typeof record.survey === 'object');
  } catch {
    return [];
  }
}

export function saveResult(result: StudyResult) {
  try {
    const results = readResults();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...results, result]));
    window.dispatchEvent(new Event(RESULTS_CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function getStoredResultCount() {
  return readResults().length;
}

export function subscribeToStoredResults(onChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) onChange();
  }

  window.addEventListener('storage', handleStorage);
  window.addEventListener(RESULTS_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(RESULTS_CHANGED_EVENT, onChange);
  };
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[;"\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createResultsCsv(results: StudyResult[]) {
  const headers = [
    'participant_code', 'question_bank_version', 'protocol_version', 'prior_exposure', 'training_actions', 'started_at', 'completed_at', 'duration_seconds',
    'pre_question_ids', 'training_question_ids', 'post_question_ids',
    'pre_answers', 'training_answers', 'post_answers',
    'pre_score', 'pre_total', 'training_score', 'training_total',
    'pre_signs_score', 'pre_signals_score', 'pre_priority_score',
    'training_signs_score', 'training_signals_score', 'training_priority_score',
    'post_signs_score', 'post_signals_score', 'post_priority_score',
    'training_xp', 'training_level', 'max_streak', 'hearts_left', 'badges',
    'post_score', 'post_total', 'score_change',
    ...surveyStatements.map((item) => `survey_${item.id}`),
  ];
  const rows = results.map((result) => [
    result.participantCode,
    result.questionBankVersion ?? '',
    result.protocolVersion ?? '',
    result.priorExposure ?? '',
    JSON.stringify(result.trainingActions ?? []),
    result.startedAt,
    result.completedAt,
    result.durationSeconds,
    (result.preQuestionIds ?? []).join(','),
    (result.trainingQuestionIds ?? []).join(','),
    (result.postQuestionIds ?? []).join(','),
    (result.preAnswers ?? []).join(','),
    (result.trainingAnswers ?? []).join(','),
    (result.postAnswers ?? []).join(','),
    result.preScore,
    result.preTotal,
    result.trainingScore,
    result.trainingTotal,
    ...modes.map((mode) => result.preTopicScores?.[mode] ?? ''),
    ...modes.map((mode) => result.trainingTopicScores?.[mode] ?? ''),
    ...modes.map((mode) => result.postTopicScores?.[mode] ?? ''),
    result.trainingXp ?? 0,
    result.trainingLevel ?? 1,
    result.maxStreak ?? 0,
    result.heartsLeft ?? 3,
    (result.unlockedBadges ?? []).join(','),
    result.postScore,
    result.postTotal,
    result.postScore - result.preScore,
    ...surveyStatements.map((item) => result.survey[item.id] ?? ''),
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(';')).join('\n');
}

export function exportResultsCsv(results: StudyResult[] = readResults()) {
  const csv = createResultsCsv(results);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pdd-practice-results-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function createParticipantCode() {
  const randomPart = crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase();
  return `PDD-${randomPart}`;
}

export function countCorrect(items: Question[], answers: number[]) {
  return answers.reduce((total, answer, index) => total + (answer === items[index].correctAnswer ? 1 : 0), 0);
}

export function countCorrectByMode(items: Question[], answers: number[]): Record<QuestionMode, number> {
  const scores: Record<QuestionMode, number> = { signs: 0, signals: 0, priority: 0 };
  answers.forEach((answer, index) => {
    const question = items[index];
    if (question && answer === question.correctAnswer) scores[question.mode] += 1;
  });
  return scores;
}

export function calculateTrainingGameSummary(items: Question[], answers: number[], totalQuestions = items.length): TrainingGameSummary {
  let xp = 0;
  let streak = 0;
  let maxStreak = 0;
  let heartsLeft = 3;
  let correctCount = 0;

  answers.forEach((answer, index) => {
    const isCorrect = answer === items[index]?.correctAnswer;
    if (isCorrect) {
      correctCount += 1;
      streak += 1;
      maxStreak = Math.max(maxStreak, streak);
      xp += 100 + Math.min(100, Math.max(0, streak - 1) * 25);
    } else {
      streak = 0;
      heartsLeft = Math.max(0, heartsLeft - 1);
      xp += 20;
    }
  });

  const unlockedBadges: BadgeId[] = [];
  if (correctCount >= 1) unlockedBadges.push('first-correct');
  if (maxStreak >= 3) unlockedBadges.push('hot-streak');
  if (correctCount >= 10) unlockedBadges.push('road-expert');
  if (correctCount === items.length && items.length === totalQuestions && items.length > 0) unlockedBadges.push('perfect-route');

  return {
    xp,
    level: Math.floor(xp / 500) + 1,
    maxStreak,
    heartsLeft,
    unlockedBadges,
  };
}
