'use client';

import { useState, useSyncExternalStore } from 'react';
import { Box, Button, Flex, Grid, Heading, Link, Text } from '@chakra-ui/react';
import { STUDY_PROTOCOL_VERSION, type TrainingAction } from '../../lib/learning-game';
import { useCityProgress } from '../../lib/city-progress';
import NextLink from 'next/link';
import { AssessmentPanel } from '../components/assessment-panel';
import { QUESTION_BANK_VERSION } from '../../lib/questions';
import { SurveyPanel } from '../components/survey-panel';
import { TrainingPanel } from '../components/training-panel';
import {
  countCorrect, countCorrectByMode, badgeCatalog, createParticipantCode, createStudyQuestionSets,
  exportResultsCsv, getStoredResultCount, saveResult, subscribeToStoredResults,
  surveyStatements, type StudyResult, type SurveyId, type TrainingGameSummary, type StudyQuestionSets,
} from '../../lib/study';

type StudyPhase = 'briefing' | 'pretest' | 'training' | 'posttest' | 'survey' | 'result';
const phaseLabels: Record<StudyPhase, string> = {
  briefing: 'Подготовка', pretest: 'Входной тест', training: 'Тренировка',
  posttest: 'Итоговый тест', survey: 'Анкета', result: 'Результат',
};

export default function StudyPage() {
  const [phase, setPhase] = useState<StudyPhase>('briefing');
  const [priorExposure,setPriorExposure] = useState<'yes'|'no'|'unknown'>('unknown');
  const [trainingActions,setTrainingActions] = useState<TrainingAction[]>([]);
  const [consent, setConsent] = useState(false);
  const [participantCode, setParticipantCode] = useState('');
  const [questionSets, setQuestionSets] = useState<StudyQuestionSets | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [preAnswers, setPreAnswers] = useState<number[]>([]);
  const [trainingAnswers, setTrainingAnswers] = useState<number[]>([]);
  const [trainingGame, setTrainingGame] = useState<TrainingGameSummary | null>(null);
  const [postAnswers, setPostAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<StudyResult | null>(null);
  const [savedLocally, setSavedLocally] = useState(false);
  const cityProgress = useCityProgress();
  const storedCount = useSyncExternalStore(subscribeToStoredResults, getStoredResultCount, () => 0);

  function beginStudy() {
    if (!consent) return;
    setParticipantCode(createParticipantCode());
    setQuestionSets(createStudyQuestionSets());
    setStartedAt(Date.now());
    setPhase('pretest');
  }

  function completeSurvey(survey: Record<SurveyId, number>) {
    if (!questionSets) return;
    const completedAt = new Date();
    const studyResult: StudyResult = {
      participantCode,
      questionBankVersion: QUESTION_BANK_VERSION,
      protocolVersion: STUDY_PROTOCOL_VERSION,
      priorExposure,
      trainingActions,
      preQuestionIds: questionSets.pretest.map((question) => question.id),
      trainingQuestionIds: questionSets.training.map((question) => question.id),
      postQuestionIds: questionSets.posttest.map((question) => question.id),
      preAnswers, trainingAnswers, postAnswers,
      preTopicScores: countCorrectByMode(questionSets.pretest, preAnswers),
      trainingTopicScores: countCorrectByMode(questionSets.training, trainingAnswers),
      postTopicScores: countCorrectByMode(questionSets.posttest, postAnswers),
      startedAt: new Date(startedAt).toISOString(),
      completedAt: completedAt.toISOString(),
      durationSeconds: Math.max(1, Math.round((completedAt.getTime() - startedAt) / 1000)),
      preScore: countCorrect(questionSets.pretest, preAnswers), preTotal: questionSets.pretest.length,
      trainingScore: countCorrect(questionSets.training, trainingAnswers), trainingTotal: questionSets.training.length,
      trainingXp: trainingGame?.xp ?? 0, trainingLevel: trainingGame?.level ?? 1,
      maxStreak: trainingGame?.maxStreak ?? 0, heartsLeft: trainingGame?.heartsLeft ?? 3,
      unlockedBadges: trainingGame?.unlockedBadges ?? [],
      postScore: countCorrect(questionSets.posttest, postAnswers), postTotal: questionSets.posttest.length,
      survey,
    };
    setSavedLocally(saveResult(studyResult));
    setResult(studyResult);
    setPhase('result');
  }

  function resetStudy() {
    setConsent(false); setParticipantCode(''); setQuestionSets(null); setStartedAt(0);
    setPreAnswers([]); setTrainingAnswers([]); setTrainingGame(null); setPostAnswers([]);
    setTrainingActions([]); setPriorExposure('unknown'); setResult(null); setSavedLocally(false); setPhase('briefing');
  }

  const averageSurvey = result ? surveyStatements.reduce((sum, item) => sum + result.survey[item.id], 0) / surveyStatements.length : 0;



  return <Box as="main" minH="100vh" bg="canvas" color="ink">
    <Box as="header" borderBottomWidth="1px" borderColor="line" bg="white">
      <Flex maxW="6xl" mx="auto" px={{ base: 5, md: 8 }} py={4} align="center" justify="space-between" gap={4} wrap="wrap">
        <Flex align="center" gap={3}>
          <Box display="grid" placeItems="center" w={11} h={11} flexShrink={0} bg="amber" borderRadius="xl" fontWeight="black" fontSize="xl">П</Box>
          <Box><Text fontWeight="bold" lineHeight="1.2">ПДД Практика</Text><Text display={{ base: 'none', sm: 'block' }} fontSize="xs" color="muted">Исследовательская версия тренажёра</Text></Box>
        </Flex>
        <Flex gap={3} align="center" wrap="wrap"><Link asChild color="navy" fontWeight="bold" px={3} py={2} borderWidth="1px" borderColor="line" borderRadius="xl"><NextLink href="/">← Мини-игры</NextLink></Link><Box as="span" px={4} py={2} bg="sky" borderRadius="full" fontSize="sm" fontWeight="bold">{phaseLabels[phase]}</Box></Flex>
      </Flex>
    </Box>

    {phase !== 'briefing' && phase !== 'result' && <Text maxW="6xl" mx="auto" px={{ base: 5, md: 8 }} pt={3} fontSize="xs" color="muted">При выходе в мини-игры незавершённое исследование сбросится. Завершённые результаты останутся в браузере.</Text>}

    {phase === 'briefing' && <Grid as="section" maxW="6xl" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 10, md: 16 }} gap={8} templateColumns={{ base: '1fr', lg: '1.05fr .95fr' }} alignItems="center">
      <Box>
        <Text color="navy" fontSize="sm" fontWeight="bold" letterSpacing="widest" textTransform="uppercase">Учебное исследование</Text>
        <Heading as="h1" mt={4} maxW="3xl" fontSize={{ base: '5xl', md: '7xl' }} lineHeight="1.04" letterSpacing="tight">Проверьте знания.<br />Пройдите практику.<br /><Box as="span" color="navy">Сравните результат.</Box></Heading>
        <Text mt={6} maxW="2xl" fontSize="lg" lineHeight="1.8" color="muted">Сессия состоит из входного теста, тренировки с объяснениями, итогового теста и короткой анкеты. Проходите её в удобном темпе, без ограничения времени.</Text>
      </Box>
      <Box bg="white" borderWidth="1px" borderColor="line" borderRadius="3xl" p={{ base: 6, md: 8 }} boxShadow="0 20px 55px rgba(22,48,77,.08)">
        <Heading as="h2" fontSize="2xl">Перед началом</Heading>
        <Grid as="ol" mt={5} gap={3} listStyleType="none">
          {['6 вопросов без подсказок', '12 тренировочных ситуаций с объяснениями', '6 итоговых вопросов без подсказок', '5 оценок удобства тренажёра'].map((item, index) =>
            <Flex as="li" key={item} align="center" gap={3} p={3} bg="canvas" borderRadius="xl" fontSize="sm" color="muted"><Box as="span" display="grid" placeItems="center" w={8} h={8} flexShrink={0} bg="white" color="navy" borderRadius="full" fontWeight="bold">{index + 1}</Box>{item}</Flex>)}
        </Grid>
        <Flex as="label" mt={6} gap={3} p={4} borderWidth="1px" borderColor="line" borderRadius="xl" fontSize="sm" lineHeight="1.7" cursor="pointer">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} style={{ width: 20, height: 20, marginTop: 4, flexShrink: 0, accentColor: '#183b63' }} />
          <Text>Я добровольно участвую в учебном тестировании. Имя, телефон и электронная почта не запрашиваются. Результаты сохраняются в этом браузере под случайным кодом; для передачи исследователю я самостоятельно скачиваю CSV. Я могу прекратить участие в любой момент.</Text>
        </Flex>
        <Box mt={4}><label htmlFor="prior-exposure">Вы уже играли в мини-игры этого проекта до входного теста?</label><select id="prior-exposure" value={priorExposure} onChange={event=>setPriorExposure(event.target.value as typeof priorExposure)} style={{display:'block',marginTop:8,width:'100%',padding:12,border:'1px solid #d9e2ec',borderRadius:12}}><option value="unknown">Не помню / не уверен</option><option value="no">Нет, это первое знакомство</option><option value="yes">Да, уже пробовал</option></select><Text mt={2} fontSize="xs" color="muted">Для исследования сначала пройдите входной тест. Предыдущее знакомство будет отмечено в выгрузке.</Text></Box><Button onClick={beginStudy} disabled={!consent} mt={5} w="full" bg="amber" color="ink" borderRadius="xl" py={7} fontWeight="bold" _hover={{ bg: '#d5961f' }}>Начать исследование</Button>
        {cityProgress.played && <Text mt={3} fontSize="xs" color="muted">На этом устройстве запускали мини-игры. Укажите свой опыт: предыдущий игрок мог быть другим человеком.</Text>}
        {storedCount > 0 && <Text mt={4} textAlign="center" fontSize="xs" color="muted">На этом устройстве сохранено сессий: {storedCount}</Text>}
      </Box>
    </Grid>}

    {phase === 'pretest' && questionSets && <AssessmentPanel eyebrow="Этап 1 · Входной тест" title="Что вы знаете сейчас?" description="Ответьте на шесть случайно выбранных вопросов без объяснений. Результат станет исходной точкой для сравнения." questions={questionSets.pretest} onComplete={(answers) => { setPreAnswers(answers); setPhase('training'); }} />}
    {phase === 'training' && questionSets && <TrainingPanel questions={questionSets.training} onComplete={(answers, game, actions) => { setTrainingActions(actions); setTrainingAnswers(answers); setTrainingGame(game); setPhase('posttest'); }} />}
    {phase === 'posttest' && questionSets && <AssessmentPanel eyebrow="Этап 3 · Итоговый тест" title="Что изменилось после практики?" description="Ещё шесть новых вопросов без повторов и подсказок. После теста останется коротко оценить интерфейс." questions={questionSets.posttest} onComplete={(answers) => { setPostAnswers(answers); setPhase('survey'); }} />}
    {phase === 'survey' && <SurveyPanel onComplete={completeSurvey} />}

    {phase === 'result' && result && <Box as="section" maxW="5xl" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 10, md: 16 }}>
      <Box overflow="hidden" bg="white" borderWidth="1px" borderColor="line" borderRadius="3xl" boxShadow="0 20px 55px rgba(22,48,77,.08)">
        <Grid gap={8} bg="ink" color="white" px={{ base: 6, md: 10 }} py={9} templateColumns={{ base: '1fr', lg: '1fr auto' }} alignItems="end">
          <Box><Text color="paleAmber" fontSize="sm" fontWeight="bold" letterSpacing="widest" textTransform="uppercase">Исследование завершено</Text><Heading as="h1" mt={3} fontSize={{ base: '4xl', md: '6xl' }}>Спасибо за участие</Heading><Text mt={3} color="sky">Анонимный код участника: <Box as="strong" color="white">{result.participantCode}</Box></Text></Box>
          <Box display="grid" placeItems="center" w={28} h={28} border="8px solid" borderColor="amber" borderRadius="full" textAlign="center"><Box><Text fontSize="2xl" fontWeight="bold">{result.postScore - result.preScore >= 0 ? '+' : ''}{result.postScore - result.preScore}</Text><Text fontSize="xs">изменение</Text></Box></Box>
        </Grid>
        <Grid gap={4} p={{ base: 6, md: 10 }} templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}>
          <ResultCard label="До тренировки" value={`${result.preScore} / ${result.preTotal}`} />
          <ResultCard label="После тренировки" value={`${result.postScore} / ${result.postTotal}`} accent />
          <ResultCard label="Учебные задания" value={`${result.trainingScore} / ${result.trainingTotal}`} />
        </Grid>
        <Box mx={{ base: 6, md: 10 }} mb={4} p={5} borderWidth="1px" borderColor="line" borderRadius="2xl">
          <Flex wrap="wrap" justify="space-between" gap={4} align="end"><Box><Text fontSize="xs" color="muted" fontWeight="bold" textTransform="uppercase">Игровой прогресс</Text><Text mt={1} fontSize="2xl" fontWeight="bold">Уровень {result.trainingLevel} · {result.trainingXp} XP</Text></Box><Text color="muted" fontWeight="bold">Лучшая серия ×{result.maxStreak} · запас {'♥'.repeat(result.heartsLeft)}{'♡'.repeat(3 - result.heartsLeft)}</Text></Flex>
          <Flex mt={4} wrap="wrap" gap={2}>{result.unlockedBadges.length > 0 ? result.unlockedBadges.map((id) => <Box as="span" key={id} px={3} py={2} bg="paleAmber" borderRadius="full" fontSize="sm" fontWeight="bold">★ {badgeCatalog[id].title}</Box>) : <Text fontSize="sm" color="muted">Достижения откроются после правильных ответов в тренировке.</Text>}</Flex>
        </Box>
        <Grid mx={{ base: 6, md: 10 }} mb={8} gap={4} p={5} bg="canvas" borderRadius="2xl" templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}>
          <ResultMetric label="Средняя оценка" value={`${averageSurvey.toFixed(1)} / 5`} /><ResultMetric label="Время прохождения" value={`${Math.ceil(result.durationSeconds / 60)} мин`} /><ResultMetric label="Сессий на устройстве" value={`${storedCount}`} />
        </Grid>
        <Box mx={{ base: 6, md: 10 }} mb={6} p={5} bg="sky" borderRadius="2xl"><Heading as="h2" fontSize="xl">Дорожная лаборатория</Heading><Text mt={2}>Вернитесь к перекрёсткам или попробуйте светофоры, скоростной маршрут и навигатор.</Text><Link asChild mt={3} display="inline-block" fontWeight="bold" textDecoration="underline"><NextLink href="/games/traffic">Перейти к свободной игре →</NextLink></Link></Box>
        {!savedLocally && <Text role="alert" mx={{ base: 6, md: 10 }} mb={4} color="navy">Браузер не сохранил результат. Скачайте CSV этой сессии перед выходом или началом нового участника.</Text>}
        <Flex justify="space-between" direction={{ base: 'column', md: 'row' }} wrap="wrap" gap={3} p={{ base: 6, md: 10 }} borderTopWidth="1px" borderColor="line">
          <Button onClick={() => exportResultsCsv([result])} variant="outline" borderColor="line" color="ink" borderRadius="xl" px={6} py={6}>Скачать результат этой сессии CSV</Button>
          {savedLocally && <Button onClick={() => exportResultsCsv()} variant="outline" borderColor="line" color="ink" borderRadius="xl" px={6} py={6}>Скачать все результаты CSV</Button>}
          <Button onClick={resetStudy} bg="amber" color="ink" borderRadius="xl" px={6} py={6} _hover={{ bg: '#d5961f' }}>Новый участник</Button>
        </Flex>
      </Box>
    </Box>}
  </Box>;
}

function ResultCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <Box p={5} bg={accent ? 'sky' : 'canvas'} borderRadius="2xl"><Text fontSize="sm" color="muted" fontWeight="bold">{label}</Text><Text mt={2} fontSize="4xl" fontWeight="bold">{value}</Text></Box>;
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return <Box><Text fontSize="xs" color="muted" fontWeight="bold" textTransform="uppercase">{label}</Text><Text mt={1} fontSize="2xl" fontWeight="bold">{value}</Text></Box>;
}
