'use client';
import DownloadPreviewModal from '@/components/DownloadPreviewModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
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
        className='w-full p-3 text-center transition rounded bg-slate-600 hover:shadow-xl hover:bg-slate-500'
        onClick={() => {
          window.open(`osucollector://collections/${collection.id}`, '_blank', 'noreferrer');
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
        Download maps
      </Button>
    );
  } else {
    return (
      <Dialog open={previewOpen}>
        <DialogTrigger
          className='w-full p-3 text-center transition rounded bg-slate-600 hover:shadow-xl hover:bg-slate-500'
          onClick={() => setPreviewOpen(true)}
        >
          Download maps
        </DialogTrigger>
        <DownloadPreviewModal collection={collection} open={previewOpen} close={() => setPreviewOpen(false)} />
      </Dialog>
    );
  }
}
