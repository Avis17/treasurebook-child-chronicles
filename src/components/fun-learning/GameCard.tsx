
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  emoji: string;
  color: string;
  iconColor: string;
}

interface GameCardProps {
  game: Game;
  onClick: () => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-200 ${game.color} border-0`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className={`rounded-full p-3 ${game.iconColor} bg-white/30 dark:bg-black/20`}>
            {game.icon}
          </div>
          <div className="text-3xl">{game.emoji}</div>
        </div>
        <h3 className="text-xl font-semibold mt-4 mb-2">{game.title}</h3>
        <p className="text-sm opacity-80">{game.description}</p>
      </div>
      <CardFooter className="bg-white/50 dark:bg-black/20 p-4">
        <Button onClick={onClick} className="w-full flex items-center gap-2">
          <Play className="h-4 w-4" /> Play Game
        </Button>
      </CardFooter>
    </Card>
  );
}
