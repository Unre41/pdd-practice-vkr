import { notFound } from 'next/navigation';
import { TrafficGame } from '../../components/traffic-game';

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (game !== 'traffic' && game !== 'signal' && game !== 'speed' && game !== 'route') notFound();
  return <TrafficGame game={game} />;
}
