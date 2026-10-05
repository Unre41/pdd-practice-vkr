'use client';

import { useMemo, useState } from 'react';
import { Box, Button, Flex, Grid, Heading, Link, Text } from '@chakra-ui/react';
import { modeLabels, type Question, type QuestionMode } from '../../lib/questions';
import { badgeCatalog, calculateTrainingGameSummary, type TrainingGameSummary } from '../../lib/study';
import { LearningScene } from './learning-scene';
import type { TrainingAction } from '../../lib/learning-game';

type Props = { questions: Question[]; onComplete: (answers: number[], game: TrainingGameSummary, actions: TrainingAction[]) => void };
const modeOrder: QuestionMode[] = ['signs', 'signals', 'priority'];

function getCurrentStreak(questions: Question[], answers: number[]) {
  let streak = 0;
  for (let index = answers.length - 1; index >= 0; index -= 1) {
    if (answers[index] !== questions[index].correctAnswer) break;
    streak += 1;
  }
  return streak;
}

export function TrainingPanel({ questions, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<(number | null)[]>(questions.map(() => null));
  const [actions,setActions] = useState<TrainingAction[]>([]);
  const question = questions[currentIndex];
  const selected = responses[currentIndex];
  const isAnswered = selected !== null;
  const isCorrect = selected === question.correctAnswer;
  const score = responses.reduce<number>((total, answer, index) => total + (answer === questions[index].correctAnswer ? 1 : 0), 0);
  const answered = responses.slice(0, currentIndex + (isAnswered ? 1 : 0)) as number[];
  const game = calculateTrainingGameSummary(questions.slice(0, answered.length), answered, questions.length);
  const visibleStreak = getCurrentStreak(questions, answered);
  const answerReward = isAnswered ? (isCorrect ? 100 + Math.min(100, Math.max(0, visibleStreak - 1) * 25) : 20) : 0;
  const modeRanges = useMemo(() => modeOrder.map((mode) => ({ mode, first: questions.findIndex((item) => item.mode === mode), last: questions.map((item) => item.mode).lastIndexOf(mode) })), [questions]);

  function chooseAnswer(index: number, action: TrainingAction) {
    if (!isAnswered) { setActions((current)=>[...current,action]); setResponses((current) => current.map((answer, answerIndex) => answerIndex === currentIndex ? index : answer)); }
  }

  function goNext() {
    if (currentIndex === questions.length - 1) onComplete(responses as number[], calculateTrainingGameSummary(questions, responses as number[]), actions);
    else setCurrentIndex((index) => index + 1);
  }

  return (
    <Grid as="section" maxW="6xl" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 8, lg: 12 }} gap={8} templateColumns={{ base: '1fr', lg: '0.72fr 1.28fr' }}>
      <Flex as="aside" direction="column" justify="space-between" gap={8} alignSelf="start" position={{ lg: 'sticky' }} top={8}>
        <Box>
          <Text color="navy" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Этап 2 · Обучение</Text>
          <Heading as="h1" mt={4} fontSize={{ base: '4xl', md: '5xl' }} lineHeight="1.05" letterSpacing="tight">12 ситуаций.<br />Одно правило за раз.</Heading>
          <Text mt={5} maxW="md" color="muted" lineHeight="1.8">Управляй сценой: настрой скорость, выбери место остановки или дай команду участнику движения. После действия прочитай разбор правила.</Text>
          <Grid mt={6} templateColumns="repeat(3, 1fr)" gap={2} aria-label="Игровые показатели">
            <GameStat label="Опыт" value={`${game.xp} XP`} /><GameStat label="Серия" value={`×${visibleStreak}`} /><GameStat label="Запас" value={`${'♥'.repeat(game.heartsLeft)}${'♡'.repeat(3 - game.heartsLeft)}`} />
          </Grid>
        </Box>
        <Grid as="nav" gap={2} aria-label="Разделы тренировки">
          {modeRanges.map(({ mode, first, last }) => {
            const active = question.mode === mode;
            const complete = currentIndex > last;
            return <Flex key={mode} justify="space-between" align="center" p={3} borderWidth="1px" borderColor={active ? 'navy' : 'line'} bg={active ? 'white' : 'sky'} borderRadius="xl">
              <Flex align="center" gap={3} fontWeight="semibold"><Box w="2.5" h="2.5" borderRadius="full" bg={complete ? 'navy' : active ? 'amber' : 'muted'} />{modeLabels[mode]}</Flex>
              <Text fontSize="sm" color="muted">{first + 1}–{last + 1}</Text>
            </Flex>;
          })}
        </Grid>
      </Flex>
      <Box as="article" overflow="hidden" bg="white" borderWidth="1px" borderColor="line" borderRadius="3xl" boxShadow="0 20px 55px rgba(22,48,77,.08)">
        <Box px={{ base: 6, md: 8 }} py={5} borderBottomWidth="1px" borderColor="line">
          <Flex justify="space-between" align="center" gap={4}><Box><Text fontSize="xs" color="muted" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Задание {currentIndex + 1} из {questions.length}</Text><Text mt={1} fontWeight="bold">{question.title}</Text></Box><Box as="span" px={3} py={2} bg="sky" borderRadius="full" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">{score} верно</Box></Flex>
          <Box mt={4} h="2" overflow="hidden" bg="sky" borderRadius="full"><Box h="full" w={`${((currentIndex + 1) / questions.length) * 100}%`} bg="navy" borderRadius="full" /></Box>
        </Box>
        <Grid gap={7} p={{ base: 6, md: 8 }}>
          <Box>
            <Heading as="h2" fontSize={{base:'2xl',md:'3xl'}} mb={4}>{question.prompt}</Heading>
            <LearningScene key={question.id} question={question} disabled={isAnswered} onAction={chooseAnswer}/>            {isAnswered && <Box mt={5} p={5} bg={isCorrect ? 'sky' : 'paleAmber'} color="ink" borderRadius="2xl" role="status" fontSize="sm" lineHeight="1.7">
              <Flex justify="space-between" wrap="wrap" gap={2} mb={2}><Text fontWeight="bold">{isCorrect ? 'Верно.' : 'Разберём ошибку.'}</Text><Text fontWeight="bold">+{answerReward} XP{isCorrect && visibleStreak >= 2 ? ` · серия ×${visibleStreak}` : ''}</Text></Flex>
              <Text>{question.explanation}</Text><Link href={question.sourceUrl} target="_blank" rel="noreferrer" mt={2} display="inline-block" color="navy" fontWeight="bold" textDecoration="underline">{question.rule}</Link>
              {game.unlockedBadges.length > 0 && <Text mt={3} pt={3} borderTopWidth="1px" borderColor="line" fontSize="xs" fontWeight="bold">Достижения: {game.unlockedBadges.map((id) => badgeCatalog[id].title).join(' · ')}</Text>}
            </Box>}
            <Flex mt={6} justify="flex-end"><Button onClick={goNext} disabled={!isAnswered} bg="ink" color="white" borderRadius="xl" px={6} py={6} _hover={{ bg: 'navy' }}>{currentIndex === questions.length - 1 ? 'Перейти к итоговому тесту' : 'Следующее задание'}</Button></Flex>
          </Box>
        </Grid>
      </Box>
    </Grid>
  );
}

function GameStat({ label, value }: { label: string; value: string }) {
  return <Box p={3} textAlign="center" bg="white" borderWidth="1px" borderColor="line" borderRadius="xl"><Text color="muted" fontSize="xs" fontWeight="bold" textTransform="uppercase">{label}</Text><Text mt={1} color="navy" fontSize="sm" fontWeight="bold" whiteSpace="nowrap">{value}</Text></Box>;
}
