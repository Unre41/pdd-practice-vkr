import type { Question } from './questions.ts';

export const STUDY_PROTOCOL_VERSION = '2026-10-03-interactive-v1';
export type TrainingAction = { questionId: string; mechanism: string; input: string; correct: boolean; durationMs: number };
export type LearningTask = { kind: 'speed' | 'stop' | 'actor' | 'decision'; instruction: string; controls: string[]; correctInput?: number };
const tasks: Record<string, LearningTask> = {
  'sign-speed-40': {kind:'speed', instruction:'Настрой ограничитель на максимальную скорость, разрешённую этим знаком.', controls:[],correctInput:40},
  'sign-speed-lower': {kind:'speed',instruction:'Пустой участок, помех нет. Установи скорость 30 км/ч и проверь, разрешено ли так проехать под знаком 40.',controls:[],correctInput:30},
  'sign-stop': {kind:'stop',instruction:'Стоп-линии нет. Выбери место, где остановишь переднюю часть машины до проезда.',controls:['За перекрёстком','Перед краем пересекаемой дороги','У знака']},
  'sign-stop-line': {kind:'stop',instruction:'Стоп-линия обозначена белой полосой. Выбери место остановки передней части машины.',controls:['Перед стоп-линией','Под знаком','За перекрёстком']},
  'sign-no-entry': {kind:'decision',instruction:'Знак задаёт ограничение. Помести его на тот участок схемы, который он запрещает.',controls:['Место остановки','Въезд на дорогу','Выезд с односторонней дороги']},
  'sign-no-entry-pedestrian': {kind:'actor',instruction:'Определи, запрещает ли знак движение пешеходу по тротуару. Выбери действие пешехода.',controls:['Остановить всегда','Продолжить по тротуару','Идти только без тротуара']},
  'sign-main-road': {kind:'decision',instruction:'Включи область действия преимущества, обозначенного жёлтым ромбом.',controls:['Нерегулируемый перекрёсток','Скорость без ограничения','Пешеходный переход']},
  'sign-main-road-scope': {kind:'decision',instruction:'Поставь знак приоритета в условия, где он определяет очерёдность.',controls:['Светофор выключен','Любой работающий светофор','Только переход']},
  'signal-yellow': {kind:'decision',instruction:'Ты можешь остановиться без экстренного торможения. Выбери действие машины на жёлтый.',controls:['Продолжить','Остановиться','Ускориться']},
  'signal-priority-conflict': {kind:'decision',instruction:'Выбери регулятор, по которому определишь очерёдность на работающем светофоре.',controls:['Знак','Разметка','Светофор']},
  'maneuver-right-turn': {kind:'actor',instruction:'Перед поворотом пропусти тех, чьи пути пересекает машина. Выбери участников.',controls:['Пешеход и велосипедист','Только пешеход','Ехать без уступки']},
  'maneuver-parking-exit': {kind:'actor',instruction:'Выпусти участника, который должен проехать первым при выезде с парковки.',controls:['Машина с парковки','Машина на дороге','Первый с указателем']},
  'priority-right-hand': {kind:'actor',instruction:'Машина справа едет прямо. Дай команду своему автомобилю на равнозначном перекрёстке.',controls:['Ехать первым','Ждать регулировщика','Пропустить справа']},
  'priority-left-turn': {kind:'actor',instruction:'Ты поворачиваешь налево. Выпусти того, кто имеет преимущество.',controls:['Встречная машина','Твоя машина','Обе одновременно']},
  'priority-roundabout': {kind:'actor',instruction:'Въезд с неглавной дороги обозначен знаком 4.3. Выбери, кого пропустишь.',controls:['Никого','Машину на круге','Только автобус']},
  'priority-bus-stop': {kind:'actor',instruction:'В населённом пункте автобус отъезжает от обозначенной остановки. Дай команду машине.',controls:['Обогнать','Посигналить и ехать','Пропустить автобус']},
  'signal-flashing-green': {kind:'decision',instruction:'Выбери режим движения при мигающем зелёном сигнале.',controls:['Движение запрещено','Разрешено, сигнал истекает','Нерегулируемый режим']},
  'signal-red-yellow': {kind:'decision',instruction:'Машина остановлена перед линией. Красный и жёлтый горят вместе. Выбери команду.',controls:['Тронуться','Оставаться перед линией','Повернуть направо']},
  'maneuver-indicator-priority': {kind:'actor',instruction:'Автомобиль включил указатель. Реши, получает ли он преимущество.',controls:['Да, включил заранее','Нет, уступает по правилам','Да, вправо']},
  'maneuver-reverse-safety': {kind:'decision',instruction:'Разреши движение задним ходом только при подходящем условии.',controls:['Безопасно, нет помех','Включена аварийка','Любой перекрёсток']},
  'priority-traffic-light-off': {kind:'decision',instruction:'Светофор выключен. Выбери действующее управление приоритетом.',controls:['Только помеха справа','Знаки и правила перекрёстка','Поворотники']},
  'priority-tram-equal': {kind:'actor',instruction:'Равнозначный нерегулируемый перекрёсток. Выпусти транспорт с преимуществом.',controls:['Легковая машина','Трамвай','Транспорт справа']},
  'priority-pedestrian-crossing': {kind:'actor',instruction:'Пешеход вступил на переход. Управляй автомобилем.',controls:['Пропустить пешехода','Посигналить и ехать','Пропускать только группу']},
  'priority-emergency-vehicle': {kind:'actor',instruction:'Синий маячок и специальный звуковой сигнал включены. Освободи путь.',controls:['Уступить','Продолжить','Ждать красного']},
};
export function learningTask(question: Question) {
  const task = tasks[question.id];
  if (!task) throw new Error(`Нет игровой сцены для ${question.id}`);
  return task;
}
export function actionIsCorrect(question: Question, input: number) {
  const task=learningTask(question);
  return task.kind==='speed' ? input===task.correctInput : input===question.correctAnswer;
}
