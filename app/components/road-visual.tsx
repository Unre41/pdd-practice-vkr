import type { RoadVisual as RoadVisualType } from '../../lib/questions';

type Props = {
  visual: RoadVisualType;
};

const Car = ({ label, className = '' }: { label: string; className?: string }) => (
  <span className={`scene-car ${className}`} aria-label={label} title={label}>
    <span className="scene-car-window" />
  </span>
);

export function RoadVisual({ visual }: Props) {
  if (visual === 'flashing-green' || visual === 'red-yellow' || visual === 'lights-off') {
    const description = visual === 'flashing-green' ? 'Зелёный сигнал мигает' : visual === 'red-yellow' ? 'Красный и жёлтый включены одновременно' : 'Все сигналы выключены';
    return <div style={{ display: 'grid', justifyItems: 'center', gap: 16 }}><div className="traffic-light" role="img" aria-label={description}><span className={visual === 'red-yellow' ? 'active-red' : ''} /><span className={visual === 'red-yellow' ? 'active-yellow' : ''} /><span className={visual === 'flashing-green' ? 'active-green' : ''} /></div><span>{description}</span></div>;
  }
  const sceneDescriptions: Partial<Record<RoadVisualType, { label: string; symbol: string }>> = {
    indicator: { label: 'Автомобиль подаёт сигнал поворота', symbol: 'АВТО →' },
    reverse: { label: 'Автомобиль готовится двигаться задним ходом', symbol: '← АВТО' },
    tram: { label: 'Трамвай и автомобиль на равнозначных дорогах', symbol: 'ТРАМВАЙ + АВТО' },
    'pedestrian-crossing': { label: 'Пешеход вступил на нерегулируемый переход', symbol: 'ПЕРЕХОД' },
    emergency: { label: 'Синий маячок и специальный звуковой сигнал включены', symbol: 'СПЕЦАВТО' },
  };
  const scene = sceneDescriptions[visual];
  if (scene) return <div role="img" aria-label={scene.label} style={{ textAlign: 'center', maxWidth: '90%' }}><div style={{ padding: 24, border: '3px solid #183b63', borderRadius: 20, background: 'white', fontWeight: 800 }}>{scene.symbol}</div><p style={{ marginTop: 16 }}>{scene.label}</p></div>;
  if (visual === 'speed-40') {
    return <div className="sign sign-speed" aria-label="Знак ограничения максимальной скорости 40 километров в час">40</div>;
  }

  if (visual === 'no-entry') {
    return <div className="sign sign-no-entry" aria-label="Знак Въезд запрещён"><span /></div>;
  }

  if (visual === 'stop') {
    return <div className="sign sign-stop" aria-label="Знак Движение без остановки запрещено">STOP</div>;
  }

  if (visual === 'main-road') {
    return <div className="sign-main-road" aria-label="Знак Главная дорога"><span /></div>;
  }

  if (visual === 'yellow-light') {
    return (
      <div className="traffic-light" aria-label="Светофор с жёлтым сигналом">
        <span /><span className="active-yellow" /><span />
      </div>
    );
  }

  if (visual === 'signal-over-sign') {
    return (
      <div className="scene-pair" aria-label="Светофор рядом со знаком главной дороги">
        <div className="traffic-light small"><span /><span /><span className="active-green" /></div>
        <div className="sign-main-road small"><span /></div>
      </div>
    );
  }

  if (visual === 'right-turn') {
    return (
      <div className="intersection-scene" aria-label="Автомобиль поворачивает направо, дорогу пересекают пешеход и велосипедист">
        <span className="crosswalk" />
        <Car label="Ваш автомобиль" className="car-bottom" />
        <span className="turn-arrow">↱</span>
        <span className="pedestrian">●</span>
        <span className="cyclist">◉</span>
      </div>
    );
  }

  if (visual === 'parking-exit') {
    return (
      <div className="intersection-scene parking-scene" aria-label="Автомобиль выезжает с парковки на дорогу">
        <span className="parking-label">P</span>
        <Car label="Автомобиль с парковки" className="car-left" />
        <Car label="Автомобиль на дороге" className="car-road" />
        <span className="direction-arrow">→</span>
      </div>
    );
  }

  if (visual === 'right-hand-rule') {
    return (
      <div className="intersection-scene" aria-label="Два автомобиля на равнозначном перекрёстке">
        <Car label="Ваш автомобиль" className="car-bottom" />
        <Car label="Автомобиль справа" className="car-right" />
        <span className="route route-up">↑</span>
        <span className="route route-left">←</span>
      </div>
    );
  }

  if (visual === 'left-turn') {
    return (
      <div className="intersection-scene" aria-label="Левый поворот и встречный автомобиль">
        <Car label="Ваш автомобиль" className="car-bottom" />
        <Car label="Встречный автомобиль" className="car-top" />
        <span className="route route-turn">↰</span>
        <span className="route route-down">↓</span>
      </div>
    );
  }

  if (visual === 'roundabout') {
    return (
      <div className="roundabout-scene" aria-label="Въезд автомобиля на круговой перекрёсток">
        <span className="roundabout-ring">↻</span>
        <Car label="Автомобиль на круге" className="car-circle" />
        <Car label="Въезжающий автомобиль" className="car-enter" />
      </div>
    );
  }

  return (
    <div className="bus-scene" aria-label="Автобус начинает движение от остановки">
      <span className="bus">АВТОБУС</span>
      <span className="bus-stop-sign">A</span>
      <Car label="Ваш автомобиль" className="car-following" />
      <span className="bus-arrow">→</span>
    </div>
  );
}
