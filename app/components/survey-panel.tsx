'use client';

import { useState } from 'react';
import { Box, Button, Flex, Grid, Heading, Text } from '@chakra-ui/react';
import { surveyStatements, type SurveyId } from '../../lib/study';

type Ratings = Partial<Record<SurveyId, number>>;

export function SurveyPanel({ onComplete }: { onComplete: (ratings: Record<SurveyId, number>) => void }) {
  const [ratings, setRatings] = useState<Ratings>({});
  const isComplete = surveyStatements.every((statement) => ratings[statement.id] !== undefined);

  return (
    <Box as="section" maxW="4xl" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 9, md: 14 }}>
      <Box overflow="hidden" bg="white" borderWidth="1px" borderColor="line" borderRadius="3xl" boxShadow="0 20px 55px rgba(22,48,77,.08)">
        <Box bg="ink" color="white" px={{ base: 6, md: 10 }} py={8}>
          <Text fontSize="sm" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" color="paleAmber">Этап 4 · Короткая анкета</Text>
          <Heading as="h1" mt={3} fontSize={{ base: '3xl', md: '5xl' }}>Оцените работу тренажёра</Heading>
          <Text mt={3} maxW="2xl" lineHeight="1.8" color="sky">Ответьте на пять утверждений. Оценка 1 означает «совсем не согласен», 5 — «полностью согласен».</Text>
        </Box>
        <Grid gap={4} p={{ base: 6, md: 10 }}>
          {surveyStatements.map((statement, statementIndex) => (
            <Box as="fieldset" key={statement.id} borderWidth="1px" borderColor="line" borderRadius="2xl" p={5}>
              <Box as="legend" px={1} fontWeight="bold" lineHeight="1.6"><Box as="span" mr={2} color="muted">{statementIndex + 1}.</Box>{statement.label}</Box>
              <Grid mt={4} templateColumns="repeat(5, 1fr)" gap={2} aria-label={`Оценка утверждения: ${statement.label}`}>
                {[1, 2, 3, 4, 5].map((value) => {
                  const selected = ratings[statement.id] === value;
                  return <Button key={value} type="button" aria-pressed={selected} onClick={() => setRatings((current) => ({ ...current, [statement.id]: value }))}
                    variant="outline" borderRadius="xl" py={6} borderColor={selected ? 'navy' : 'line'} bg={selected ? 'navy' : 'canvas'} color={selected ? 'white' : 'ink'} _hover={{ bg: selected ? 'navy' : 'sky' }} _focusVisible={{ outline: '3px solid', outlineColor: 'amber' }}>{value}</Button>;
                })}
              </Grid>
              <Flex mt={2} justify="space-between" color="muted" fontSize="xs"><Text>Не согласен</Text><Text>Полностью согласен</Text></Flex>
            </Box>
          ))}
          <Flex mt={2} direction="column" align="flex-end" gap={2}>
            {!isComplete && <Text fontSize="sm" color="muted">Поставьте оценку по каждому утверждению.</Text>}
            <Button disabled={!isComplete} onClick={() => onComplete(ratings as Record<SurveyId, number>)} bg="amber" color="ink" borderRadius="xl" px={7} py={6} fontWeight="bold" _hover={{ bg: '#d5961f' }}>Сохранить результат</Button>
          </Flex>
        </Grid>
      </Box>
    </Box>
  );
}
