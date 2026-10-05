'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { markFreePlay, recordCityLevel } from '../../lib/city-progress';
import NextLink from 'next/link';
import { blockedRoutes, canStart, canTravel, routeEdges, routeMaps, signalCycles, signalNames, currentSpeedLimit } from '../../lib/city-mini-games';

type Kind = 'signal' | 'speed' | 'route';
const titles: Record<Kind,string> = { signal: 'Поймай зелёный', speed: 'Скоростной маршрут', route: 'Навигатор' };
const descriptions: Record<Kind,string> = {
  signal: 'Машина стоит перед стоп-линией. Дождись разрешающего сигнала и трогайся. Пройди три светофора; таймер не штрафует за ожидание.',
  speed: 'Довези машину через три маршрута с изменяющимися ограничениями. На отметках 34% и 68% действует новый знак. Снижай скорость заранее: превышение останавливает машину.',
  route: 'Проведи легковую машину к финишу. Нажимай на следующую точку дороги и обходи въезды со знаком «Въезд запрещён». Стрелки показывают направления игровых маршрутов.',
};
const sources = {
  signal: 'https://www.consultant.ru/document/cons_doc_LAW_2709/4b7a10a56ed37080fc96999db5f3db6f3aa58cc6/',
  signs: 'https://www.consultant.ru/document/cons_doc_LAW_2709/bf1f4781b8aa1172e9993c89c36db0dcdc88c495/',
};
export function CityMiniGames({ kind }: { kind: Kind }) {
  const [level, setLevel] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [tick, setTick] = useState(0);
  const [moving, setMoving] = useState(false);
  const [done, setDone] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [node, setNode] = useState(0);
  const [previousNode, setPreviousNode] = useState(0);
  const [message, setMessage] = useState('Приступай: все действия выполняются на игровом поле.');
  const cycle = signalCycles[level];
  const signal = cycle[tick % cycle.length];
  const routeNodes = routeMaps[level];
  const limit = currentSpeedLimit(level,distance);
  const finished = done && level === 2;
  const stars = Math.max(1, 3 - mistakes);
  useEffect(()=>{if(done)recordCityLevel(kind+'-'+level,stars);},[done,kind,level,stars]);
  useEffect(() => {
    if (kind !== 'signal' || moving || done) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 2000);
    return () => window.clearInterval(timer);
  }, [kind, moving, done]);
  useEffect(() => {
    if (!moving || kind === 'speed') return;
    const timer = window.setTimeout(() => { setMoving(false); if (kind === 'signal' || node === 5) { setDone(true); setMessage('Участок пройден!'); } }, 900);
    return () => window.clearTimeout(timer);
  }, [moving, kind, node]);
  useEffect(() => {
    if (kind !== 'speed' || !moving || done) return;
    const timer = window.setInterval(() => {
      if (speed > limit) { setMoving(false); setSpeed(0); setMistakes((value) => value + 1); setMessage(`Превышение: на этом участке максимум ${limit} км/ч. Машина остановлена. Снизь скорость и продолжи.`); }
      else if (distance >= 100) { setMoving(false); setDone(true); setMessage('Участок пройден без превышения!'); }
      else setDistance((value) => Math.min(100, value + speed / 12));
    }, 200);
    return () => window.clearInterval(timer);
  }, [kind, moving, done, speed, limit, distance]);
  function next() {
    setLevel((value) => value + 1); setMistakes(0); setDone(false); setTick(0); setSpeed(0); setDistance(0); setNode(0); setPreviousNode(0); setMessage('Новый участок. Посмотри на дорожную обстановку.');
  }
  function restart() {
    setLevel(0); setMistakes(0); setDone(false); setMoving(false); setTick(0); setSpeed(0); setDistance(0); setNode(0); setPreviousNode(0); setMessage('Новый рейс. Попробуй собрать три звезды.');
  }
  function start() {
    if (moving || done) return;
    markFreePlay();
    if (kind === 'signal' && !canStart(signal)) { setMistakes((value) => value + 1); setMessage('Машина остаётся перед стоп-линией. Этот сигнал запрещает начинать движение; дождись зелёного.'); return; }
    if (kind === 'speed' && speed === 0) { setMessage('Добавь скорость ползунком, чтобы тронуться.'); return; }
    setMoving(true); setMessage('Машина едет…');
  }
  function travel(to: number) {
    if (moving || done || !routeEdges.some(([a,b]) => a === node && b === to)) return;
    markFreePlay();
    if (!canTravel(node,to,level)) { setMistakes((value) => value + 1); setMessage('Здесь въезд запрещён. Машина осталась на месте — найди другую дорогу.'); return; }
    setPreviousNode(node); setNode(to); setMoving(true); setMessage(to === 5 ? 'Финиш уже рядом…' : 'Едем к следующей точке.');
  }
  const statusLabel = kind === 'signal' ? signalNames[signal] : kind === 'speed' ? `${speed} км/ч` : `Точка ${node + 1}`;
  return <Box as="main" className="game-shell" minH="100vh" color="white" px={{ base: 4, md: 8 }} py={6}>
    <Box maxW="5xl" mx="auto">
      <Flex justify="space-between" gap={3} wrap="wrap"><Link asChild color="white" fontWeight="bold"><NextLink href="/">ПДД Практика / Город</NextLink></Link><Link asChild color="#b8cad5" fontSize="sm" px={3} py={2} border="1px solid #496477" borderRadius="xl"><NextLink href="/study">Исследовательский маршрут</NextLink></Link></Flex>
      <Text mt={6} color="#74d9ea" fontWeight="bold" fontSize="xs">МИНИ-ИГРА · 3 УЧАСТКА</Text><Heading as="h1" mt={2} fontSize={{ base: '3xl', md: '5xl' }}>{titles[kind]}</Heading><Text mt={3} maxW="3xl" color="#b8cad5" lineHeight="1.7">{descriptions[kind]}</Text>
      <Flex mt={5} gap={3} wrap="wrap" justify="space-between"><Text>Участок {level + 1} / 3</Text><Text>Ошибки: {mistakes} · {statusLabel}</Text></Flex>
      <Box mt={4} overflow="hidden" borderRadius="2xl" bg="#567c60" border="1px solid #496477">
        <svg viewBox="0 0 500 440" className="traffic-board" aria-label={`${titles[kind]}. ${statusLabel}`}>
          <defs><marker id={`arrow-${kind}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d2e4df"/></marker></defs>
          {kind === 'route' ? <>
            {routeEdges.map(([a,b]) => { const [x,y]=routeNodes[a]; const [tx,ty]=routeNodes[b]; const blocked=blockedRoutes[level].includes(`${a}-${b}`); return <g key={`${a}-${b}`}><path d={`M${x} ${y}L${tx} ${ty}`} stroke="#3c4d58" strokeWidth="24"/><path d={`M${x} ${y}L${tx} ${ty}`} stroke="#b8cad5" strokeWidth="2" strokeDasharray="8 12" markerEnd={`url(#arrow-${kind})`}/>{blocked && <g aria-label={`Въезд запрещён: ${a+1} → ${b+1}`}><circle cx={(x+tx)/2} cy={(y+ty)/2} r="17" fill="#d84747" stroke="white" strokeWidth="2"/><path d={`M${(x+tx)/2-11} ${(y+ty)/2}h22`} stroke="white" strokeWidth="6"/></g>}</g>; })}
            {routeNodes.map(([x,y],i) => { const adjacent=routeEdges.some(([a,b])=>a===node&&b===i); return <g key={i} role="button" aria-label={`Ехать к точке ${i+1}`} aria-disabled={!adjacent||moving||done} tabIndex={adjacent&&!moving&&!done?0:-1} className={adjacent&&!moving&&!done?'game-car-ready game-car':''} onClick={()=>travel(i)} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();travel(i);}}}><circle className="car-focus" cx={x} cy={y} r="23" fill={i===node?'#ffcc57':adjacent?'#74d9ea':'#20394a'} stroke="#d2e4df" strokeWidth="2"/><text x={x} y={y+6} textAnchor="middle" fill={i===node||adjacent?'#122638':'white'} fontWeight="bold" fontSize="16">{i===5?'⚑':i+1}</text></g>;})}
            <g key={`${level}-${node}`} aria-hidden="true">{moving?<animateMotion dur=".85s" fill="freeze" path={`M${routeNodes[previousNode][0]} ${routeNodes[previousNode][1]}L${routeNodes[node][0]} ${routeNodes[node][1]}`}/>:<animateMotion dur=".01s" fill="freeze" path={`M${routeNodes[node][0]} ${routeNodes[node][1]}l0 0`}/>}<rect x="-15" y="-9" width="30" height="18" rx="5" fill="#ffcc57" stroke="#122638"/><rect x="-5" y="-7" width="9" height="14" rx="2" fill="#25445d"/></g>
          </> : <>
            <rect y="165" width="500" height="110" fill="#3c4d58"/><path d="M0 220H500" stroke="white" strokeWidth="3" strokeDasharray="14 12"/>
            {kind==='signal' && <><path d="M145 167V217" stroke="white" strokeWidth="5"/><rect x="160" y="43" width="42" height="111" rx="12" fill="#122638"/>{['red','yellow','green'].map((color,i)=><circle key={color} cx="181" cy={64+i*34} r="12" fill={signal===color||signal==='red-yellow'&&color!=='green'?{red:'#fa6b6b',yellow:'#ffcc57',green:'#77e89a'}[color]:'#344954'}/>)}</>}
            {kind==='speed' && <><circle cx="310" cy="102" r="40" fill="white" stroke="#d84747" strokeWidth="8"/><text x="310" y="114" textAnchor="middle" fill="#122638" fontSize="34" fontWeight="bold">{limit}</text><text x="250" y="327" textAnchor="middle" fill="white" fontSize="20">{speed} км/ч · путь {Math.round(distance)}%</text><text x="250" y="365" textAnchor="middle" fill="white" fontSize="15">Далее: {currentSpeedLimit(level,34)} км/ч с 34%; {currentSpeedLimit(level,68)} км/ч с 68%</text></>}
            <g key={kind==='signal'?`${level}-${moving}`:level} transform={kind==='speed'?`translate(${60+distance*4.3} 191)` : undefined}>
              {kind==='signal'&&<animateMotion dur={moving?'.85s':'.01s'} fill="freeze" path={moving?'M95 191L550 191':'M95 191l0 0'}/>}
              <rect x="-29" y="-17" width="58" height="34" rx="9" fill="#ffcc57" stroke="#122638" strokeWidth="2"/><rect x="5" y="-12" width="12" height="24" rx="3" fill="#25445d"/>
            </g>
          </>}
        </svg>
      </Box>
      <Box mt={4} p={4} bg="#20394a" borderRadius="xl" role="status" aria-live="polite">{finished?`Рейс завершён · ${'★'.repeat(stars)}${'☆'.repeat(3-stars)} · ошибок: ${mistakes}`:message}</Box>
      {kind==='speed' && <Box mt={5}><label htmlFor="driving-speed" style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><Text>Скорость машины</Text><Text>{speed} км/ч</Text></label><input id="driving-speed" type="range" min="0" max="80" step="5" value={speed} disabled={done} onChange={(e)=>setSpeed(Number(e.target.value))} style={{width:'100%',accentColor:'#ffcc57',minHeight:44}}/></Box>}
      <Flex mt={4} gap={3} wrap="wrap">
        {kind!=='route' && <Button bg="#ffcc57" color="#122638" disabled={moving||done} onClick={start}>Поехали →</Button>}
        {kind==='speed'&&<Button variant="outline" color="white" borderColor="#496477" disabled={done} onClick={()=>{setSpeed(0);setMessage('Машина остановлена. Добавь скорость, чтобы продолжить.');}}>Тормоз</Button>}
        {kind==='route'&&routeNodes.map((_,i)=>routeEdges.some(([a,b])=>a===node&&b===i)&&<Button key={i} disabled={moving||done} bg="#74d9ea" color="#122638" onClick={()=>travel(i)}>Ехать к точке {i+1}</Button>)}
        {done&&!finished&&<Button bg="#74d9ea" color="#122638" onClick={next}>Следующий участок →</Button>}
        <Button variant="outline" color="white" borderColor="#496477" onClick={restart}>Начать заново</Button>
      </Flex>
      <Text mt={5} fontSize="sm" color="#b8cad5">{kind==='signal'?'В этой сцене машина уже остановилась, других участников на дороге нет. Жёлтый и красный с жёлтым не разрешают трогаться.':kind==='speed'?'Соблюдай указанную максимальную скорость. Низкая скорость не штрафуется; игра не оценивает все условия выбора безопасной скорости.':'Знак 3.1 запрещает въезд в данном направлении. В игре используется обычный легковой автомобиль.'} <Link href={kind==='signal'?sources.signal:sources.signs} target="_blank" rel="noreferrer" color="#74d9ea" textDecoration="underline">{kind==='signal'?'ПДД 6.2':kind==='speed'?'ПДД, знак 3.24':'ПДД, знак 3.1'}</Link></Text>
      <Text mt={3} fontSize="xs" color="#b8cad5">Звёзды за рейс: 3 без ошибок, 2 с одной, 1 за завершение. Свободная игра не записывает данные исследования.</Text>
    </Box>
  </Box>;
}
