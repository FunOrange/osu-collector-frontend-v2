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
import { Tournament } from '@/entities/Tournament';
import { useUser } from '@/services/osu-collector-api-hooks';
import Link from 'next/link';
import { useState } from 'react';

export interface DownloadMapsButtonProps {
  tournament: Tournament;
}
export default function DownloadMapsButton({ tournament }: DownloadMapsButtonProps) {
  const { user } = useUser();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [clientOpened, setClientOpened] = useState(false);
  if (user?.paidFeaturesAccess) {
    return (
      <Dialog open={clientOpened} onOpenChange={(open) => setClientOpened(open)}>
        <DialogTrigger
          className='w-full p-3 text-center transition rounded bg-slate-600 hover:shadow-xl hover:bg-slate-500'
          onClick={() => {
            window.open(`osucollector://tournaments/${tournament.id}`, '_blank', 'noreferrer');
            setClientOpened(true);
          }}
        >
          Download maps
        </DialogTrigger>
        <DialogContent onPointerDownOutside={() => setClientOpened(false)}>
          <DialogHeader>
            <DialogTitle>Tournament opened in osu!Collector desktop client!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Don&apos;t have the desktop client installed?{' '}
            <Link href='/client' className='font-semibold hover:underline text-gray-50'>
              Click here{/* TODO: link directly to download */}
            </Link>{' '}
            to download it.
          </DialogDescription>
        </DialogContent>
      </Dialog>
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
