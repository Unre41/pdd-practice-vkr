export type VehicleId = 'A' | 'B' | 'C';
export type TrafficVehicle = { id: VehicleId; from: 'south' | 'east' | 'north'; turn: 'straight' | 'left'; label: string };
export type TrafficMission = { id: string; title: string; description: string; rule: string; explanation: string; vehicles: TrafficVehicle[]; order: VehicleId[]; alternativeOrders?: VehicleId[][]; mainRoad?: 'horizontal' };
export const trafficMissions: TrafficMission[] = [
  { id: 'right', title: 'Встреча на перекрёстке', description: 'Две легковые машины едут прямо по равнозначным дорогам. Светофора и знаков приоритета нет. Выпустите машины по очереди.', rule: 'ПДД РФ, пункт 13.11', explanation: 'Для автомобиля А машина Б находится справа. Сначала проезжает Б, затем А.', vehicles: [{ id: 'A', from: 'south', turn: 'straight', label: 'А — снизу, прямо' }, { id: 'B', from: 'east', turn: 'straight', label: 'Б — справа, прямо' }], order: ['B', 'A'] },
  { id: 'left', title: 'Левый поворот', description: 'Равнозначные дороги, светофора и знаков приоритета нет. А поворачивает налево, встречный Б едет прямо. Выпустите машины по очереди.', rule: 'ПДД РФ, пункт 13.12', explanation: 'Поворачивающий налево автомобиль А уступает встречному Б, который едет прямо.', vehicles: [{ id: 'A', from: 'south', turn: 'left', label: 'А — снизу, налево' }, { id: 'B', from: 'north', turn: 'straight', label: 'Б — сверху, прямо' }], order: ['B', 'A'] },
  { id: 'chain', title: 'Три направления', description: 'Главная дорога идёт слева направо: перед Б стоит жёлтый ромб. Перед А и В — знаки «Уступите дорогу». Все три машины едут прямо. Светофора нет.', rule: 'ПДД РФ, пункт 13.9', explanation: 'Б едет по главной дороге и проезжает первым. А и В уступают ему. Затем А и В могут проехать в любом порядке: их встречные прямые траектории не пересекаются.', mainRoad: 'horizontal', vehicles: [{ id: 'A', from: 'south', turn: 'straight', label: 'А — снизу, прямо' }, { id: 'B', from: 'east', turn: 'straight', label: 'Б — справа, прямо' }, { id: 'C', from: 'north', turn: 'straight', label: 'В — сверху, прямо' }], order: ['B', 'C', 'A'], alternativeOrders: [['B', 'A', 'C']] },
];

export type TrafficState = { passed: VehicleId[]; moving: VehicleId | null; mistakes: number; feedback: 'ready' | 'wrong' | 'moving' | 'correct' | 'complete' };
export const initialTrafficState = (): TrafficState => ({ passed: [], moving: null, mistakes: 0, feedback: 'ready' });
export function selectVehicle(mission: TrafficMission, state: TrafficState, id: VehicleId): TrafficState {
  if (state.moving || state.passed.includes(id) || state.passed.length === mission.order.length || !mission.vehicles.some((car) => car.id === id)) return state;
  const permitted = [mission.order, ...(mission.alternativeOrders ?? [])].some((order) => state.passed.every((passed, i) => passed === order[i]) && id === order[state.passed.length]);
  if (!permitted) return { ...state, mistakes: state.mistakes + 1, feedback: 'wrong' };
  return { ...state, moving: id, feedback: 'moving' };
}
export function finishMovement(mission: TrafficMission, state: TrafficState): TrafficState {
  if (!state.moving) return state;
  const passed = [...state.passed, state.moving];
  return { ...state, moving: null, passed, feedback: passed.length === mission.order.length ? 'complete' : 'correct' };
}
export function trafficStars(state: TrafficState) {
  return state.feedback === 'complete' ? Math.max(1, 3 - state.mistakes) : 0;
}
