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
import { Tournament } from '@/shared/entities/v1/Tournament';
import { useUser } from '@/services/osu-collector-api-hooks';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/components/shadcn/use-toast';
import { Button } from '@/components/shadcn/button';
import { ToastAction } from '@/components/shadcn/toast';

export interface DownloadMapsButtonProps {
  tournament: Tournament;
}
export default function DownloadMapsButton({ tournament }: DownloadMapsButtonProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [previewOpen, setPreviewOpen] = useState(false);
  if (user?.paidFeaturesAccess) {
    return (
      <Button
        className='w-full p-3 text-center transition rounded bg-slate-600 hover:shadow-xl hover:bg-slate-500'
        onClick={() => {
          window.open(`osucollector://tournaments/${tournament.id}`, '_blank', 'noreferrer');
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
        <DownloadPreviewModal
          collection={{
            // @ts-ignore:next-line
            id: `T${tournament.id}`,
            // @ts-ignore:next-line
            uploader: '',
            name: tournament.name,
            // @ts-ignore:next-line
            beatmapsets: tournament.rounds
              ?.map((round) => round.mods.map((mod) => mod.maps))
              ?.flat(2)
              ?.filter((beatmap) => typeof beatmap === 'object'),
          }}
          open={previewOpen}
          close={() => setPreviewOpen(false)}
        />
      </Dialog>
    );
  }
}
