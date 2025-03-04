import { cn } from '@/utils/shadcn-utils';
import Image from 'next/image';
import Link from 'next/link';

export interface UserChipProps {
  user: { id: number; username: string; rank?: number };
  className?: string;
  href?: string;
}
export default function UserChip({ user, className, href = '#' }: UserChipProps) {
  const classNames = cn(
    'flex items-center justify-start px-2 py-1 transition rounded-lg cursor-pointer first-letter:items-center hover:bg-slate-900',
    className,
  );
  const content = (
    <>
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
    </>
  );
  return href.startsWith('/') ? (
    <Link href={href} className={classNames}>
      {content}
    </Link>
  ) : (
    <a href={href} className={classNames} target='_blank' rel='noreferrer'>
      {content}
    </a>
  );
}
