'use client';

import { useState } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import type { Question } from '../../lib/questions';
import { actionIsCorrect, learningTask, type TrainingAction } from '../../lib/learning-game';
import { RoadVisual } from './road-visual';

export function LearningScene({ question, disabled, onAction }: { question: Question; disabled: boolean; onAction: (answer: number, action: TrainingAction) => void }) {
  const [speed,setSpeed]=useState(0);
  const [startedAt]=useState(()=>Date.now());
  const [outcome,setOutcome]=useState<boolean|null>(null);
  const task=learningTask(question);
  function labelLines(label:string) {
    const lines=[''];
    for(const word of label.split(' ')) {
      const last=lines.length-1;
      if(lines[last]&&(lines[last]+' '+word).length>18)lines.push(word);
      else lines[last]+=(lines[last]?' ':'')+word;
    }
    return lines;
  }
  function act(input: number) {
    if(disabled||outcome!==null)return;
    const correct=actionIsCorrect(question,input); setOutcome(correct);
    // Время фиксируется только обработчиком нажатия, а не во время рендера.
    // eslint-disable-next-line react-hooks/purity
    onAction(correct?question.correctAnswer:-1,{questionId:question.id,mechanism:task.kind,input:task.kind==='speed'?String(input):task.controls[input],correct,durationMs:Math.max(0,Date.now()-startedAt)});
  }
  return <Box>
    <Text mb={3} fontWeight="bold">{task.instruction}</Text>
    <Box bg="sky" borderRadius="2xl" overflow="hidden">
      <Box display="grid" placeItems="center" minH="14rem"><RoadVisual visual={question.visual}/></Box>
      <svg viewBox="0 0 600 205" className="traffic-board" aria-label="Управление учебной ситуацией">
        <rect width="600" height="205" fill="#344954"/>
        <path d="M0 152H600" stroke="white" strokeWidth="3" strokeDasharray="12 14"/>
        {task.kind==='stop'&&<><rect x="330" width="120" height="205" fill="#60717a"/>{question.id==='sign-stop-line'&&<><path d="M278 120V185" stroke="white" strokeWidth="4"/><text x="255" y="196" fill="white" fontSize="12">Стоп-линия</text></>}<text x="335" y="196" fill="white" fontSize="12">Пересекаемая дорога</text></>}
        <g key={String(outcome)} transform="translate(40 145)" aria-hidden="true">
          {outcome===true&&<animateTransform attributeName="transform" type="translate" from="40 145" to={task.kind==='stop'?(question.id==='sign-stop-line'?'258 145':'310 145'):'650 145'} dur="1s" fill="freeze"/>}
          <rect x="-20" y="-12" width="40" height="24" rx="6" fill="#ffcc57"/><rect x="3" y="-8" width="9" height="16" rx="2" fill="#183b63"/>
        </g>
        {task.kind!=='speed'&&task.controls.map((label,i)=>{
          const x=task.kind==='stop'? (question.id==='sign-stop-line'?[300,100,500]:[500,300,100])[i]:100+i*200;
          return <g key={label} role="button" aria-label={label} aria-disabled={disabled} tabIndex={disabled?-1:0} className="game-car game-car-ready" onClick={()=>act(i)} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act(i);}}}>
            <rect className="car-focus" x={x-84} y="15" width="168" height="72" rx="14" fill={outcome===null?'#d2e4df':'#99aeb9'} stroke="#183b63"/>
            <text fill="#14263d" fontSize="12" textAnchor="middle">{labelLines(label).map((line,n)=><tspan key={n} x={x} y={34+n*14}>{line}</tspan>)}</text><text x={x} y="78" fill="#183b63" fontSize="11" textAnchor="middle">{task.kind==='stop'?'Остановить здесь':task.kind==='actor'?'Действие участника':'Применить к сцене'}</text>
          </g>;
        })}
        {outcome===false&&<text x="300" y="143" textAnchor="middle" fill="#ffcc57" fontSize="16">Учебная пауза — разберём правило</text>}
        {task.kind==='speed'&&<text x="300" y="87" textAnchor="middle" fill="white" fontSize="32">{speed} км/ч</text>}
      </svg>
    </Box>
    {task.kind==='speed' ? <Box mt={4}><label htmlFor="learning-speed">Ограничитель скорости: {speed} км/ч</label><input id="learning-speed" type="range" min="0" max="80" step="5" disabled={disabled} value={speed} onChange={e=>setSpeed(Number(e.target.value))} style={{display:'block',width:'100%',minHeight:44,accentColor:'#e5a52a'}}/><Button mt={2} onClick={()=>act(speed)} disabled={disabled} bg="amber" color="ink">Проверить движение</Button></Box> : <Flex mt={3} wrap="wrap" gap={2} aria-label="Команды учебной сцены">{task.controls.map((label,i)=><Button key={label} onClick={()=>act(i)} disabled={disabled} variant="outline" h="auto" minH="44px" py={3} whiteSpace="normal">{label}</Button>)}</Flex>}
  </Box>;
}
