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
import { Button } from '@/components/shadcn/button';
import { useToast } from '@/components/shadcn/use-toast';
import { ToastAction } from '@/components/shadcn/toast';

export interface AddToOsuButtonProps {
  collection: Collection;
}
export default function AddToOsuButton({ collection }: AddToOsuButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) {
      setTimeout(() => setOpen(false), 5000);
    }
  }, [open]);

  return (
    <div className='flex w-full items-stretch'>
      {user?.paidFeaturesAccess ? (
        <Button
          className='w-full p-3 text-center transition rounded rounded-r-none bg-slate-600 hover:shadow-xl hover:bg-slate-500'
          onClick={() => {
            const url = new URL(`osucollector://collections/${collection.id}`);
            // url.search = window.location.search;
            window.open(url.toString(), '_blank', 'noreferrer');
            toast({
              title: 'App launched!',
              description: "Don't have it installed?",
              action: (
                <ToastAction altText='osu!Collector app download link'>
                  <Link href='/client#download-links'>Download App</Link>
                </ToastAction>
              ),
            });
          }}
        >
          Add to osu!
        </Button>
      ) : (
        <Link
          href='/client'
          className='w-full p-3 text-center transition rounded rounded-r-none bg-slate-600 hover:shadow-xl hover:bg-slate-500'
        >
          Add to osu!
        </Link>
      )}

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
  );
}
