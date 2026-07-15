import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizes = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' };
  if (src) return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />;
  const colors = ['from-violet-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-amber-500', 'from-red-500 to-pink-500'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <div className={cn('flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white', colors[colorIndex], sizes[size], className)}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
