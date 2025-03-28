'use client';
import { Collection } from '@/shared/entities/v1/Collection';
import Link from 'next/link';
import { useUser } from '@/services/osu-collector-api-hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu';
import { useEffect, useState } from 'react';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import * as api from '@/services/osu-collector-api';
import { useRouter } from 'next/navigation';

export interface AddToOsuButtonProps {
  collection: Collection;
}
export default function AddToOsuButton({ collection }: AddToOsuButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) {
      setTimeout(() => setOpen(false), 5000);
    }
  }, [open]);

  return user ? (
    <div className='flex w-full items-stretch'>
      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogTrigger
          className='w-full p-3 text-center transition rounded sm:rounded-r-none bg-slate-600 hover:shadow-xl hover:bg-slate-500'
          onClick={() => {
            window.open(`osucollector://collections/${collection.id}`, '_blank', 'noreferrer');
          }}
        >
          Add to osu!
        </DialogTrigger>
        <DialogContent onPointerDownOutside={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Collection launched in osu!Collector desktop client!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Don&apos;t have the desktop client installed?{' '}
            <Link href='/client#download-links' className='font-semibold hover:underline text-gray-50'>
              Click here
            </Link>{' '}
            to download it.
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className='h-full hidden sm:flex transition rounded rounded-l-none cursor-pointer bg-slate-600 hover:shadow-xl hover:bg-slate-500'
        >
          <div className='flex items-center'>
            <ThreeDotsVertical className='mx-2' />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount sideOffset={0}>
          <DropdownMenuItem
            onClick={async () => {
              if (!user?.paidFeaturesAccess) {
                return router.push('/client');
              }

              const data = await api.downloadCollectionDb(collection.id).catch((err) => alert(err.message));
              if (!data) return;

              const url = window.URL.createObjectURL(new Blob([data]));
              const a = document.createElement('a');
              a.href = url;
              a.download = `${collection.uploader.username} - ${collection.name}.db`;
              document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
              a.click();
              a.remove();
            }}
          >
            Download as collection.db
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <Link
      href='/client'
      className='w-full p-3 text-center transition rounded bg-slate-600 hover:shadow-xl hover:bg-slate-500'
    >
      Add to osu!
    </Link>
  );
}
