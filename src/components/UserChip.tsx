import { cn } from '@/utils/shadcn-utils';
import Image from 'next/image';

export interface UserChipProps {
  user: { id: number; username: string; rank: number };
  className?: string;
}
export default function UserChip({ user, className }: UserChipProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-start px-2 py-1 transition rounded-lg cursor-pointer first-letter:items-center hover:bg-slate-900',
        className,
      )}
    >
      <Image
        className='mr-2 rounded-full'
        src={`https://a.ppy.sh/${user.id}`}
        width={32}
        height={32}
        alt='Collection uploader avatar'
      />
      <div className='flex flex-col text-sm'>
        <div className='whitespace-nowrap'>{user.username}</div>
        {user.rank > 0 && <small className='text-xs text-slate-500'>#{user.rank}</small>}
      </div>
    </div>
  );
}
