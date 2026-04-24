import type { Player } from '@/types';
import { cn } from '@/lib/utils';

type Props = {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-xl',
};

export default function PlayerAvatar({ player, size = 'md' }: Props) {
  const initials = player.tag.slice(0, 2).toUpperCase();
  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center font-black text-white ring-2 ring-slate-700 shadow-lg',
        player.avatarColor,
        sizes[size],
      )}
    >
      {initials}
    </div>
  );
}
