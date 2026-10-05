export const signalCycle = ['red', 'red-yellow', 'green', 'yellow'] as const;
export type Signal = typeof signalCycle[number];
export const signalNames: Record<Signal, string> = { red: 'Красный', 'red-yellow': 'Красный и жёлтый', green: 'Зелёный', yellow: 'Жёлтый' };
export const speedLimits = [40, 60, 20];
export function canStart(signal: Signal) { return signal === 'green'; }
export function withinLimit(speed: number, limit: number) { return speed > 0 && speed <= limit; }
export const routeNodes = [[50,220],[175,100],[175,340],[325,100],[325,340],[450,220]] as const;
export const routeMaps = [routeNodes, [[50,100],[175,100],[175,340],[325,220],[325,340],[450,340]], [[50,340],[175,100],[175,340],[325,100],[325,220],[450,100]]] as const;
// Варианты меняют длительность ожидания и зелёного окна, сохраняя порядок фаз.
export const signalCycles = [signalCycle, ['red','red-yellow','green','green','yellow'] as const, ['red','red','red-yellow','green','yellow'] as const];
export const speedZones = [[40,20,60],[60,40,20],[20,60,40]];
export function currentSpeedLimit(level:number,distance:number) {return speedZones[level][Math.min(2,Math.floor(distance/34))];}
export const routeEdges = [[0,1],[0,2],[1,3],[1,4],[2,3],[2,4],[3,5],[4,5]] as const;
export const blockedRoutes = [['0-1'],['0-2'],['1-3','2-4']];
export function canTravel(from: number, to: number, level: number) {
  return routeEdges.some(([a,b]) => a === from && b === to) && !blockedRoutes[level].includes(`${from}-${to}`);
}
