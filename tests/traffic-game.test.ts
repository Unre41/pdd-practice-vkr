import test from 'node:test';
import assert from 'node:assert/strict';
import { finishMovement, initialTrafficState, selectVehicle, trafficMissions, trafficStars } from '../lib/traffic-game.ts';

test('ошибка не перемещает машину и не завершает миссию', () => {
  const state = selectVehicle(trafficMissions[0], initialTrafficState(), 'A');
  assert.equal(state.mistakes, 1); assert.equal(state.moving, null); assert.deepEqual(state.passed, []); assert.equal(trafficStars(state), 0);
});
test('во время движения повторный ввод не меняет состояние', () => {
  const state = selectVehicle(trafficMissions[0], initialTrafficState(), 'B');
  assert.equal(selectVehicle(trafficMissions[0], state, 'A'), state);
  assert.equal(state.passed.length, 0);
});
test('каждая миссия завершается только после всех проездов', () => {
  for (const mission of trafficMissions) {
    let state = initialTrafficState();
    for (const id of mission.order) state = finishMovement(mission, selectVehicle(mission, state, id));
    assert.equal(state.feedback, 'complete'); assert.equal(trafficStars(state), 3);
    assert.deepEqual(state.passed, mission.order); assert.equal(selectVehicle(mission, state, 'A'), state);
  }
});
test('ошибки снижают награду, но не закрывают возможность завершения', () => {
  const mission = trafficMissions[2]; let state = initialTrafficState();
  for (let i = 0; i < 4; i++) state = selectVehicle(mission, state, 'A');
  for (const id of mission.order) state = finishMovement(mission, selectVehicle(mission, state, id));
  assert.equal(trafficStars(state), 1); assert.equal(state.mistakes, 4);
});

test('главная дорога: сначала Б, затем любой порядок встречных прямых машин', () => {
  const mission = trafficMissions[2];
  for (const order of [['B','A','C'],['B','C','A']] as const) {
    let state=initialTrafficState();
    for (const id of order) state=finishMovement(mission, selectVehicle(mission,state,id));
    assert.equal(state.feedback,'complete'); assert.equal(state.mistakes,0);
  }
  assert.equal(selectVehicle(mission,initialTrafficState(),'A').feedback,'wrong');
  assert.equal(selectVehicle(mission,initialTrafficState(),'C').feedback,'wrong');
});
