import assert from 'node:assert/strict';
import test from 'node:test';
import { questions } from '../lib/questions.ts';
import { calculateTrainingGameSummary, countCorrect, countCorrectByMode, createResultsCsv, createStudyQuestionSets, surveyStatements, type StudyResult } from '../lib/study.ts';

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test('банк заданий содержит уникальные корректные записи', () => {
  assert.equal(questions.length, 24);
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);

  for (const question of questions) {
    assert.equal(question.answers.length, 3);
    assert.ok(question.correctAnswer >= 0 && question.correctAnswer < question.answers.length);
    assert.match(question.sourceUrl, /^https:\/\//);
    assert.ok(question.explanation.length > 20);
  }
});

test('тематические блоки сбалансированы', () => {
  for (const mode of ['signs', 'signals', 'priority'] as const) {
    assert.equal(questions.filter((question) => question.mode === mode).length, 8);
  }
});

test('случайные этапы не пересекаются и покрывают банк заданий', () => {
  const sets = createStudyQuestionSets(seededRandom(42));
  assert.equal(sets.pretest.length, 6);
  assert.equal(sets.training.length, 12);
  assert.equal(sets.posttest.length, 6);
  const allIds = [...sets.pretest, ...sets.training, ...sets.posttest].map((question) => question.id);
  assert.equal(new Set(allIds).size, questions.length);

  for (const mode of ['signs', 'signals', 'priority'] as const) {
    assert.equal(sets.pretest.filter((question) => question.mode === mode).length, 2);
    assert.equal(sets.training.filter((question) => question.mode === mode).length, 4);
    assert.equal(sets.posttest.filter((question) => question.mode === mode).length, 2);
  }
});

test('разные случайные последовательности меняют состав этапов', () => {
  const first = createStudyQuestionSets(seededRandom(1));
  const second = createStudyQuestionSets(seededRandom(2));
  assert.notDeepEqual(first.pretest.map((question) => question.id), second.pretest.map((question) => question.id));
});

test('подсчёт результата корректно обрабатывает крайние случаи', () => {
  const sample = createStudyQuestionSets(seededRandom(7)).pretest;
  const correctAnswers = sample.map((question) => question.correctAnswer);
  const wrongAnswers = sample.map((question) => (question.correctAnswer + 1) % question.answers.length);
  assert.equal(countCorrect(sample, correctAnswers), sample.length);
  assert.equal(countCorrect(sample, wrongAnswers), 0);
});

test('баллы по темам считаются отдельно для контрольной формы', () => {
  const sample = createStudyQuestionSets(seededRandom(7)).pretest;
  const answers = sample.map((question) => question.correctAnswer);
  const firstSignal = sample.findIndex((question) => question.mode === 'signals');
  answers[firstSignal] = (answers[firstSignal] + 1) % sample[firstSignal].answers.length;
  assert.deepEqual(countCorrectByMode(sample, answers), { signs: 2, signals: 1, priority: 2 });
});

test('анкета содержит пять уникальных показателей', () => {
  assert.equal(surveyStatements.length, 5);
  assert.equal(new Set(surveyStatements.map((statement) => statement.id)).size, 5);
});

test('игровая прогрессия начисляет опыт, серию и достижения', () => {
  const correctAnswers = questions.map((question) => question.correctAnswer);
  const game = calculateTrainingGameSummary(questions, correctAnswers);
  assert.equal(game.heartsLeft, 3);
  assert.equal(game.maxStreak, questions.length);
  assert.ok(game.xp > questions.length * 100);
  assert.ok(game.level >= 3);
  assert.deepEqual(game.unlockedBadges, ['first-correct', 'hot-streak', 'road-expert', 'perfect-route']);
});

test('ошибка сбрасывает серию, но не блокирует обучение', () => {
  const answers = questions.slice(0, 4).map((question, index) => index === 2 ? (question.correctAnswer + 1) % question.answers.length : question.correctAnswer);
  const game = calculateTrainingGameSummary(questions.slice(0, 4), answers);
  assert.equal(game.heartsLeft, 2);
  assert.equal(game.maxStreak, 2);
  assert.ok(game.xp > 0);
  assert.ok(!game.unlockedBadges.includes('perfect-route'));
});

test('достижение за идеальный маршрут открывается только после всей тренировки', () => {
  const firstQuestion = questions[0];
  const partial = calculateTrainingGameSummary([firstQuestion], [firstQuestion.correctAnswer], 12);
  assert.ok(!partial.unlockedBadges.includes('perfect-route'));
  const full = calculateTrainingGameSummary(questions.slice(0, 12), questions.slice(0, 12).map((question) => question.correctAnswer));
  assert.ok(full.unlockedBadges.includes('perfect-route'));
});

test('CSV сохраняет структуру записи и оставляет новые поля старой записи пустыми', () => {
  const survey = Object.fromEntries(surveyStatements.map((statement) => [statement.id, 4])) as StudyResult['survey'];
  const legacy: StudyResult = {
    participantCode: 'PDD-TEST01', preQuestionIds: [], trainingQuestionIds: [], postQuestionIds: [],
    startedAt: '2026-09-30T10:00:00.000Z', completedAt: '2026-09-30T10:10:00.000Z', durationSeconds: 600,
    preScore: 2, preTotal: 6, trainingScore: 7, trainingTotal: 12,
    trainingXp: 800, trainingLevel: 2, maxStreak: 3, heartsLeft: 1, unlockedBadges: [],
    postScore: 4, postTotal: 6, survey,
  };
  const [header, row] = createResultsCsv([legacy]).split('\n').map((line) => line.split(';'));
  assert.equal(header.length, row.length);
  assert.equal(row[header.indexOf('question_bank_version')], '');
  assert.equal(row[header.indexOf('pre_signs_score')], '');
  assert.equal(row[header.indexOf('score_change')], '2');
});
