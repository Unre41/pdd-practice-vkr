import test from 'node:test';
import assert from 'node:assert/strict';
import { questions } from '../lib/questions.ts';
import { learningTask, actionIsCorrect } from '../lib/learning-game.ts';
import { currentSpeedLimit, routeMaps, canTravel } from '../lib/city-mini-games.ts';

test('каждый вопрос имеет сцену с единственным правильным действием',()=>{
  for(const question of questions) {
    const task=learningTask(question);
    const inputs=task.kind==='speed'?Array.from({length:17},(_,i)=>i*5):task.controls.map((_,i)=>i);
    assert.equal(inputs.filter(input=>actionIsCorrect(question,input)).length,1,question.id);
    if(task.kind!=='speed')assert.equal(task.controls.length,question.answers.length);
    assert.equal(actionIsCorrect(question,-1),false);
  }
});
test('маршруты изменяют ограничения и геометрию, сохраняют путь к финишу',()=>{
  for(let level=0;level<3;level++) {
    assert.equal(new Set([0,34,68].map(d=>currentSpeedLimit(level,d))).size,3);
    const reached=new Set([0]);
    for(let from=0;from<6;from++)if(reached.has(from))for(let to=0;to<6;to++)if(canTravel(from,to,level))reached.add(to);
    assert.ok(reached.has(5));
  }
  assert.notDeepEqual(routeMaps[0],routeMaps[1]);
  assert.notDeepEqual(routeMaps[1],routeMaps[2]);
});
