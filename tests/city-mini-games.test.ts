import test from 'node:test';
import assert from 'node:assert/strict';
import { canStart, canTravel, withinLimit, routeEdges, blockedRoutes, signalCycles } from '../lib/city-mini-games.ts';

test('остановленная машина не трогается на жёлтый или красный с жёлтым', () => {
  assert.equal(canStart('green'), true);
  for (const light of ['red','red-yellow','yellow'] as const) assert.equal(canStart(light), false);
});
test('скорость ограничена знаком, ноль означает остановку', () => {
  assert.equal(withinLimit(40,40),true); assert.equal(withinLimit(45,40),false); assert.equal(withinLimit(0,40),false);
});

test('варианты светофоров меняют длительность, сохраняя переход красного с жёлтым к зелёному', () => {
  const next = { red: 'red-yellow', 'red-yellow': 'green', green: 'yellow', yellow: 'red' };
  for (const cycle of signalCycles) {
    for (let i=0; i<cycle.length; i++) {
      const current=cycle[i], following=cycle[(i+1)%cycle.length];
      assert.ok(following===current || following===next[current], `${current} → ${following}`);
    }
  }
  assert.equal(new Set(signalCycles.map(cycle=>cycle.join(','))).size, 3);
});
test('каждая карта имеет путь к финишу, запрещённые въезды недоступны', () => {
  for (let level=0; level<blockedRoutes.length; level++) {
    const reached=new Set([0]);
    for (let step=0; step<6; step++) for (const [from,to] of routeEdges) if (reached.has(from)&&canTravel(from,to,level)) reached.add(to);
    assert.ok(reached.has(5));
    for (const edge of blockedRoutes[level]) { const [a,b]=edge.split('-').map(Number); assert.equal(canTravel(a,b,level),false); }
    assert.equal(canTravel(0,5,level),false);
  }
});
