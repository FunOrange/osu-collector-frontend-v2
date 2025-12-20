'use client';
import DownloadPreviewModal from '@/components/DownloadPreviewModal';
import { Dialog, DialogTrigger } from '@/components/shadcn/dialog';
import { Collection } from '@/shared/entities/v1/Collection';
import { useUser } from '@/services/osu-collector-api-hooks';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/shadcn/button';
import { useToast } from '@/components/shadcn/use-toast';
import { ToastAction } from '@/components/shadcn/toast';

export interface DownloadMapsButtonProps {
  collection: Collection;
}
export default function DownloadMapsButton({ collection }: DownloadMapsButtonProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [clientOpened, setClientOpened] = useState(false);

  useEffect(() => {
    if (clientOpened) {
      setTimeout(() => setClientOpened(false), 5000);
    }
  }, [clientOpened]);

  if (user?.paidFeaturesAccess) {
    return (
      <Button
        className='w-full rounded bg-slate-600 p-3 text-center transition hover:bg-slate-500 hover:shadow-xl'
        onClick={() => {
          const url = new URL(`osucollector://collections/${collection.id}` + window.location.search);
          // url.search = window.location.search;
          window.open(url.toString(), '_blank', 'noreferrer');
          toast({
            title: 'App launched!',
            description: "Don't have it installed?",
            action: (
              <ToastAction altText='osu!Collector app download link'>
                <Link href='/app#download-links'>Download App</Link>
              </ToastAction>
            ),
          });
        }}
      >
        Download maps
      </Button>
    );
  } else {
    return (
      <Dialog open={previewOpen}>
        <DialogTrigger
          className='w-full rounded bg-slate-600 p-3 text-center transition hover:bg-slate-500 hover:shadow-xl'
          onClick={() => setPreviewOpen(true)}
        >
          Download maps
        </DialogTrigger>
        <DownloadPreviewModal collection={collection} open={previewOpen} close={() => setPreviewOpen(false)} />
      </Dialog>
    );
  }
}
