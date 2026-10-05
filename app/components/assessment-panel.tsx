'use client';

import { useState } from 'react';
import { Box, Button, Flex, Grid, Heading, Text } from '@chakra-ui/react';
import type { Question } from '../../lib/questions';
import { RoadVisual } from './road-visual';

type Props = { eyebrow: string; title: string; description: string; questions: Question[]; onComplete: (answers: number[]) => void };

export function AssessmentPanel({ eyebrow, title, description, questions, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const question = questions[currentIndex];
  const selected = answers[currentIndex];

  function continueAssessment() {
    if (selected === null) return;
    if (currentIndex === questions.length - 1) onComplete(answers as number[]);
    else setCurrentIndex((index) => index + 1);
  }

  return (
    <Grid as="section" maxW="6xl" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 8, lg: 12 }} gap={8} templateColumns={{ base: '1fr', lg: '0.72fr 1.28fr' }}>
      <Box as="aside" alignSelf="start" position={{ lg: 'sticky' }} top={8}>
        <Text color="navy" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">{eyebrow}</Text>
        <Heading as="h1" mt={4} fontSize={{ base: '4xl', md: '5xl' }} lineHeight="1.05" letterSpacing="tight">{title}</Heading>
        <Text mt={5} maxW="md" color="muted" lineHeight="1.8">{description}</Text>
        <Box mt={7} p={5} bg="white" borderWidth="1px" borderColor="line" borderRadius="2xl" color="muted" fontSize="sm" lineHeight="1.7">Во время теста правильные ответы не показываются. Это помогает сравнить результат до и после тренировки.</Box>
      </Box>
      <Box as="article" overflow="hidden" bg="white" borderWidth="1px" borderColor="line" borderRadius="3xl" boxShadow="0 20px 55px rgba(22,48,77,.08)">
        <Box px={{ base: 6, md: 8 }} py={5} borderBottomWidth="1px" borderColor="line">
          <Flex justify="space-between" align="center" gap={4}>
            <Box><Text fontSize="xs" color="muted" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Вопрос {currentIndex + 1} из {questions.length}</Text><Text mt={1} fontWeight="bold">{question.title}</Text></Box>
            <Box as="span" px={3} py={2} bg="sky" borderRadius="full" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">Без подсказок</Box>
          </Flex>
          <Box mt={4} h="2" overflow="hidden" bg="sky" borderRadius="full"><Box h="full" w={`${((currentIndex + 1) / questions.length) * 100}%`} bg="navy" borderRadius="full" /></Box>
        </Box>
        <Grid gap={7} p={{ base: 6, md: 8 }}>
          <Box className="road-pattern scene-board" display="grid" placeItems="center" minH="14rem" overflow="hidden" borderRadius="2xl" bg="sky"><RoadVisual visual={question.visual} /></Box>
          <Box>
            <Heading as="h2" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">{question.prompt}</Heading>
            <Grid mt={5} gap={3}>
              {question.answers.map((answer, index) => (
                <Button key={answer} type="button" onClick={() => setAnswers((current) => current.map((value, answerIndex) => answerIndex === currentIndex ? index : value))}
                  variant="outline" minH="3.5rem" h="auto" justifyContent="flex-start" whiteSpace="normal" textAlign="left" gap={4} px={4} py={3} borderRadius="xl"
                  borderColor={selected === index ? 'navy' : 'line'} bg={selected === index ? 'sky' : 'white'} color="ink" _hover={{ borderColor: 'navy', bg: 'sky' }} _focusVisible={{ outline: '3px solid', outlineColor: 'amber' }}>
                  <Box as="span" display="grid" placeItems="center" flexShrink={0} w={8} h={8} borderRadius="full" bg={selected === index ? 'navy' : 'canvas'} color={selected === index ? 'white' : 'muted'} fontSize="sm">{String.fromCharCode(65 + index)}</Box>{answer}
                </Button>
              ))}
            </Grid>
            <Flex mt={6} justify="flex-end"><Button onClick={continueAssessment} disabled={selected === null} bg="ink" color="white" borderRadius="xl" px={6} py={6} _hover={{ bg: 'navy' }}>{currentIndex === questions.length - 1 ? 'Завершить тест' : 'Следующий вопрос'}</Button></Flex>
          </Box>
        </Grid>
      </Box>
    </Grid>
  );
}
