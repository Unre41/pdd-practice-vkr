'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Flex, Grid, Heading, Link, Text } from '@chakra-ui/react';
import { markFreePlay, recordCityLevel, useCityProgress } from '../../lib/city-progress';
import NextLink from 'next/link';
import { CityMiniGames } from './city-mini-games';
import { finishMovement, initialTrafficState, selectVehicle, trafficMissions, trafficStars, type TrafficVehicle, type VehicleId } from '../../lib/traffic-game';

const labels = { A: 'А', B: 'Б', C: 'В' };
const colors = { A: '#ffcc57', B: '#74d9ea', C: '#c8a4ff' };
const source = 'https://www.consultant.ru/document/cons_doc_LAW_2709/74cbe820904f4f8ce76047ddbd81d14c8b953d3e/';
function position(car: TrafficVehicle) {
  return car.from === 'south' ? 'translate(260 355)' : car.from === 'east' ? 'translate(410 195) rotate(-90)' : 'translate(220 85) rotate(180)';
}
function route(car: TrafficVehicle) {
  return car.from === 'east' ? 'M410 195 L-50 195' : car.from === 'north' ? 'M220 85 L220 490' : car.turn === 'left' ? 'M260 355 L260 245 Q260 195 210 195 L-50 195' : 'M260 355 L260 -50';
}
function CarBody({ car, moving = false }: { car: TrafficVehicle; moving?: boolean }) {
  return <g transform={moving ? 'rotate(90)' : undefined}>
    <rect x="-23" y="-23" width="7" height="14" rx="2" fill="#101e2c" /><rect x="16" y="-23" width="7" height="14" rx="2" fill="#101e2c" />
    <rect x="-23" y="12" width="7" height="14" rx="2" fill="#101e2c" /><rect x="16" y="12" width="7" height="14" rx="2" fill="#101e2c" />
    <rect x="-19" y="-34" width="38" height="68" rx="11" fill={colors[car.id]} stroke="#122638" strokeWidth="2" />
    <rect x="-14" y="-22" width="28" height="15" rx="4" fill="#25445d" /><rect x="-13" y="20" width="26" height="7" rx="3" fill="#25445d" />
    <rect x="-15" y="-31" width="8" height="4" rx="1" fill="#fff5b8" /><rect x="7" y="-31" width="8" height="4" rx="1" fill="#fff5b8" />
    <text textAnchor="middle" y="14" fontSize="20" fontWeight="bold" fill="#122638">{labels[car.id]}</text>
  </g>;
}

function IntersectionGame() {
  const progress = useCityProgress();
  const [index, setIndex] = useState(0);
  const [state, setState] = useState(initialTrafficState);
  const [started, setStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [best, setBest] = useState<number[]>(trafficMissions.map(() => 0));
  const mission = trafficMissions[index];
  useEffect(() => {
    if (!state.moving) return;
    const timer = window.setTimeout(() => setState((current) => finishMovement(mission, current)), 900);
    return () => window.clearTimeout(timer);
  }, [state.moving, mission]);
  const complete = state.feedback === 'complete';
  const stars = trafficStars(state);
  const displayBest = best.map((value, i) => i === index ? Math.max(value, stars, progress.stars[`traffic-${i}`]??0) : Math.max(value,progress.stars[`traffic-${i}`]??0));
  useEffect(()=>{if(complete)recordCityLevel(`traffic-${index}`,stars);},[complete,index,stars]);
  const totalStars = displayBest.reduce((sum, value) => sum + value, 0);
  const campaignComplete = displayBest.every((value) => value > 0);
  function openMission(next: number) {
    if (next > 0 && !displayBest[next - 1]) return;
    setBest(displayBest); setIndex(next); setState(initialTrafficState()); setShowHint(false); setStarted(true);
  }
  function drive(id: VehicleId) {
    if (started) { markFreePlay(); setState((current) => selectVehicle(mission, current, id)); }
  }
  const canDrive = started && !state.moving && !complete;

  return <Box as="main" className="game-shell" minH="100vh" color="white" px={{ base: 4, md: 8 }} py={{ base: 5, md: 8 }}>
    <Box maxW="6xl" mx="auto">
      <Flex justify="space-between" align="center" gap={3} wrap="wrap">
        <Link asChild color="white" fontWeight="bold" fontSize="lg"><NextLink href="/">ПДД Практика / Город</NextLink></Link>
        <Link asChild color="#b8cad5" fontSize="sm" px={3} py={2} border="1px solid #496477" borderRadius="xl"><NextLink href="/study">Исследовательский маршрут</NextLink></Link>
      </Flex>
      <Flex mt={{ base: 6, md: 9 }} justify="space-between" align="end" gap={4} wrap="wrap">
        <Box><Text color="#74d9ea" fontSize="xs" fontWeight="bold" letterSpacing="widest">КАМПАНИЯ · 3 ПЕРЕКРЁСТКА</Text><Heading as="h1" mt={2} fontSize={{ base: '3xl', md: '5xl' }}>Дай городу движение</Heading><Text mt={3} color="#b8cad5" maxW="xl">Выпусти все машины в правильном порядке. Нажимай на автомобили, следи за дорогой и собери 9 звёзд.</Text></Box>
        <Box border="1px solid #496477" borderRadius="2xl" px={5} py={3} bg="#20394a"><Text color="#b8cad5" fontSize="xs">ЗВЁЗДЫ КАМПАНИИ</Text><Text fontSize="2xl" fontWeight="bold" color="#ffcc57">★ {totalStars} / 9</Text></Box>
      </Flex>
      <Flex as="nav" aria-label="Миссии" gap={3} mt={6}>
        {trafficMissions.map((item, i) => <Button key={item.id} className="mission-node" flex="1" minW="0" h="auto" py={3} px={{ base: 2, md: 4 }} whiteSpace="normal" disabled={i > 0 && !displayBest[i - 1]} onClick={() => openMission(i)} aria-current={i === index ? 'step' : undefined} bg={i === index ? '#ffcc57' : '#20394a'} color={i === index ? '#122638' : '#b8cad5'} border="1px solid" borderColor={i === index ? '#ffcc57' : '#496477'} _hover={{ bg: i === index ? '#ffd97d' : '#2b4b61' }}>
          <Box><Text fontSize="xs">{i > 0 && !displayBest[i - 1] ? '🔒' : `${i + 1}`}<Box as="span" display={{ base: 'none', md: 'inline' }}> · {item.title}</Box></Text><Text mt={1} letterSpacing="wide">{'★'.repeat(displayBest[i])}{'☆'.repeat(3 - displayBest[i])}</Text></Box>
        </Button>)}
      </Flex>
      <Grid mt={5} gap={5} templateColumns={{ base: '1fr', lg: '1.4fr 1fr' }} alignItems="start">
        <Box className="game-scene" position="relative" overflow="hidden" borderRadius="3xl" bg="#314e43" border="1px solid #496477">
          <Flex px={5} py={3} bg="#20394a" justify="space-between" gap={3} fontSize="sm"><Text>РАЙОН {index + 1} / 3</Text><Text color="#ffcc57">{state.passed.length} / {mission.order.length} машин проехали ✓</Text></Flex>
          <svg viewBox="0 0 480 440" className="traffic-board" aria-label={`Игровой перекрёсток. ${mission.description}`}>
            <rect width="480" height="440" fill="#567c60" />
            {[[20, 35, 125, 92], [330, 35, 130, 92], [25, 310, 110, 100], [335, 315, 120, 95]].map(([x,y,w,h],i) => <g key={i}><rect x={x+5} y={y+7} width={w} height={h} rx="12" fill="#355943" /><rect x={x} y={y} width={w} height={h} rx="12" fill={i % 2 ? '#b2c2b8' : '#d2c2a5'} /><rect x={x+10} y={y+10} width={w-20} height={h-20} rx="7" fill={i % 2 ? '#69878a' : '#9a8c78'} />{[0,1,2].map((n) => <rect key={n} x={x+18+n*28} y={y+25} width="17" height="26" rx="3" fill="#d2e4df" />)}</g>)}
            <path d="M180 0H300V440H180Z M0 160H480V280H0Z" fill="#c3cbbb" />
            <path d="M187 0H293V440H187Z M0 167H480V273H0Z" fill="#3c4d58" />
            <path d="M240 0V150 M240 290V440 M0 220H170 M310 220H480" stroke="#d5dbd2" strokeWidth="3" strokeDasharray="14 12" />
            <path d="M260 312V287 M260 287l-6 9m6-9 6 9 M359 195H330 M330 195l9-6m-9 6 9 6 M220 125V149 M220 149l-6-9m6 9 6-9" stroke="#d5dbd2" strokeWidth="3" fill="none" />
            {[[155, 28], [320, 140], [150, 295], [315, 410]].map(([x,y],i) => <g key={i}><circle cx={x+3} cy={y+5} r="14" fill="#355943"/><circle cx={x} cy={y} r="14" fill="#7caa66"/></g>)}
            {mission.mainRoad && <g aria-label="Главная дорога слева направо. Уступите дорогу снизу и сверху.">
              <path d="M325 158v-37 M155 282v37 M310 285v-34 M170 155v-34" stroke="#dbe3d8" strokeWidth="4" />
              <path d="M325 115l17 17-17 17-17-17Z M155 290l17 17-17 17-17-17Z" fill="#ffd247" stroke="white" strokeWidth="4" />
              <path d="M294 245h32l-16 28Z M154 115h32l-16 28Z" fill="white" stroke="#ef6666" strokeWidth="4" />
              <text x="330" y="93" fontSize="13" fill="white">Главная дорога</text>
            </g>}
            {mission.vehicles.filter((car) => !state.passed.includes(car.id)).map((car) => state.moving === car.id ? <g key={`${mission.id}-${car.id}-moving`} aria-hidden="true"><animateMotion path={route(car)} dur="0.85s" rotate="auto" fill="freeze" /><CarBody car={car} moving /></g> : <g key={`${mission.id}-${car.id}`} transform={position(car)} className={`game-car ${canDrive ? 'game-car-ready' : ''}`} role="button" tabIndex={canDrive ? 0 : -1} aria-label={`Выпустить: ${car.label}`} aria-disabled={!canDrive} onClick={() => drive(car.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); drive(car.id); } }}>
              <title>{car.label + ' · нажмите, чтобы выпустить'}</title><rect className="car-focus" x="-29" y="-43" width="58" height="88" rx="18" fill="transparent" stroke="transparent" strokeWidth="3" /><CarBody car={car}/>
              {car.turn === 'left' && <path d="M0 -45v-12q0-8-10-8h-8m0 0 6-5m-6 5 6 5" stroke="#ffcc57" strokeWidth="3" fill="none" />}
            </g>)}
          </svg>
          {!started && <Flex position="absolute" inset="0" bg="rgba(12,30,39,.78)" backdropFilter="blur(3px)" align="center" justify="center" direction="column" gap={4} p={6} textAlign="center"><Text fontSize="4xl" aria-hidden="true">🚦</Text><Heading as="h2" fontSize="3xl">Город ждёт тебя</Heading><Text maxW="xs" color="#d2e4df">Три перекрёстка. Сначала простой разъезд, затем поворот и очередь из трёх машин.</Text><Button bg="#ffcc57" color="#122638" size="lg" onClick={() => {markFreePlay();setStarted(true);}} _hover={{ bg: '#ffd97d' }}>Начать рейс →</Button></Flex>}
          {complete && <Box className="mission-reward" position="absolute" bottom={5} left={5} right={5} bg="#122638" border="1px solid #ffcc57" borderRadius="2xl" p={4} textAlign="center" pointerEvents="none"><Text color="#ffcc57" fontSize="3xl" letterSpacing="wide">{'★'.repeat(stars)}{'☆'.repeat(3-stars)}</Text><Text fontWeight="bold">{campaignComplete ? 'Все районы открыты!' : 'Перекрёсток свободен!'}</Text></Box>}
        </Box>
        <Box bg="#20394a" border="1px solid #496477" borderRadius="3xl" p={{ base: 5, md: 6 }}>
          <Text color="#74d9ea" fontSize="xs" fontWeight="bold">МИССИЯ {index + 1} · ВЫПУСТИТЬ ВСЕ МАШИНЫ</Text><Heading as="h2" mt={2} fontSize="2xl">{mission.title}</Heading><Text mt={3} color="#d2e0e6" lineHeight="1.7">{mission.description}</Text>
          <Flex mt={4} gap={2} aria-label="Проезд машин">{mission.order.map((_,i) => <Box key={i} flex="1" py={2} textAlign="center" borderRadius="lg" bg={state.passed[i] ? '#74d9ea' : '#122638'} color={state.passed[i] ? '#122638' : '#b8cad5'} fontWeight="bold">{state.passed[i] ? `${labels[state.passed[i]]} ✓` : '•'}</Box>)}</Flex>
          <Box role="status" aria-live="polite" mt={4} p={4} borderRadius="xl" bg={state.feedback === 'wrong' ? '#543f25' : '#122638'} minH="88px">
            {state.feedback === 'ready' && (started ? 'Нажми на машину на дороге или выбери её ниже. Кто может ехать первым?' : 'Начни рейс, чтобы управлять перекрёстком.')}
            {state.feedback === 'wrong' && 'Учебная пауза: эта машина должна уступить. Найди того, кто может проехать, и попробуй снова.'}
            {state.feedback === 'moving' && 'Машина едет. Дождись, пока перекрёсток освободится…'}
            {state.feedback === 'correct' && 'Дорога свободна. Выпусти следующую машину.'}
            {complete && <><Text fontWeight="bold" color="#ffcc57">Миссия завершена · {stars} из 3 звёзд</Text><Text mt={2}>{mission.explanation}</Text></>}
          </Box>
          <Grid gap={2} mt={4}>{mission.vehicles.map((car) => <Button key={car.id} disabled={!canDrive || state.passed.includes(car.id)} onClick={() => drive(car.id)} minH="48px" h="auto" py={3} whiteSpace="normal" justifyContent="start" bg="#122638" color="white" border="1px solid #496477" _hover={{ borderColor: colors[car.id], bg: '#2b4b61' }}><Box as="span" display="inline-block" w={3} h={3} flexShrink={0} borderRadius="full" bg={colors[car.id]} />{state.passed.includes(car.id) ? '✓ Проехал: ' : 'Выпустить: '}{car.label}</Button>)}</Grid>
          <Text mt={4} color="#b8cad5" fontSize="xs">Ошибок: {state.mistakes} · 3 звезды без ошибок, 2 с одной, 1 за завершение. Подсказка бесплатная.</Text>
          <Flex gap={2} mt={4} wrap="wrap"><Button size="sm" variant="outline" color="white" borderColor="#496477" onClick={() => setShowHint(!showHint)}>{showHint ? 'Скрыть правило' : 'Подсказка'}</Button><Button size="sm" variant="outline" color="white" borderColor="#496477" onClick={() => openMission(index)}>Повторить миссию</Button></Flex>
          {complete && index < trafficMissions.length - 1 && <Button mt={4} w="full" bg="#ffcc57" color="#122638" onClick={() => openMission(index+1)}>Следующая миссия →</Button>}
          {campaignComplete && <Box mt={4} p={4} border="1px solid #74d9ea" borderRadius="xl"><Text fontWeight="bold">Кампания пройдена · {totalStars}/9 ★</Text><Text mt={2} fontSize="sm" color="#b8cad5">Вернись в любой район и улучши результат до трёх звёзд.</Text></Box>}
          {(showHint || complete) && <Text mt={4} color="#d2e0e6" fontSize="sm" lineHeight="1.7">{mission.explanation} <Link href={source} target="_blank" rel="noreferrer" color="#74d9ea" textDecoration="underline">{mission.rule}</Link></Text>}
        </Box>
      </Grid>
      <Text mt={5} color="#b8cad5" fontSize="xs">Управление: мышь или касание; клавиатура — Tab, Enter и пробел. Лучшие звёзды сохраняются в этом браузере.</Text>
    </Box>
  </Box>;
}


export function TrafficGame({ game = 'traffic' }: { game?: 'traffic' | 'signal' | 'speed' | 'route' }) {
  const progress=useCityProgress();
  const total=Object.values(progress.stars).reduce((a,b)=>a+b,0);
  return <Box bg="#142b38" minH="100vh">
    <Flex as="nav" aria-label="Мини-игры" maxW="6xl" mx="auto" px={{ base: 4, md: 8 }} pt={4} gap={2} wrap="wrap">
      {([['traffic','🚗 Перекрёстки'],['signal','🚦 Поймай зелёный'],['speed','🏎 Скоростной маршрут'],['route','🗺 Навигатор']] as const).map(([id,label]) => <Link asChild key={id} aria-current={game === id ? 'page' : undefined} px={3} py={2} borderRadius="lg" fontSize="sm" fontWeight="semibold" bg={game === id ? '#74d9ea' : '#20394a'} color={game === id ? '#122638' : 'white'} _hover={{ bg: '#496477' }}><NextLink href={`/games/${id}`}>{label}</NextLink></Link>)}
    </Flex>
<Text color="#b8cad5" maxW="6xl" mx="auto" px={{base:4,md:8}} mt={3} fontSize="sm">Мой город · пройдено {progress.completed}/12 · лучшие звёзды {total}/36</Text>
    {game === 'traffic' ? <IntersectionGame/> : <CityMiniGames key={game} kind={game}/>}
  </Box>;
}
