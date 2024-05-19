'use client';
import DesktopFeaturePreviewOverlay from '@/components/DesktopFeaturePreviewOverlay';
import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import { Label } from '@/components/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/radio-group';
import { Tournament } from '@/entities/Tournament';
import { useUser } from '@/services/osu-collector-api-hooks';
import { s } from '@/utils/string-utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

enum ImportMethod {
  SingleCollection = 'SingleCollection',
  GroupByRound = 'GroupByRound',
  GroupByMod = 'GroupByMod',
  OneCollectionPerBeatmap = 'OneCollectionPerBeatmap',
}

export interface AddTournamentToOsuButtonProps {
  tournament: Tournament;
}
export default function AddTournamentToOsuButton({ tournament }: AddTournamentToOsuButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [desktopClientOpened, setDesktopClientOpened] = useState(false);
  const [previewOpened, setPreviewOpened] = useState(false);

  const [importMethod, setImportMethod] = useState(ImportMethod.SingleCollection);
  const previewCollections = getMappoolCollections(tournament, importMethod) ?? [];
  const [overlayVisible, setOverlayVisible] = useState(false);

  const resetPreviewModalState = () => {
    setImportMethod(ImportMethod.SingleCollection);
    setOverlayVisible(false);
  };

  return user ? (
    <div className='flex w-full'>
      <Dialog open={desktopClientOpened} onOpenChange={(open) => setDesktopClientOpened(open)}>
        <DialogTrigger
          className='w-full p-3 text-center transition rounded rounded-r-none bg-slate-600 hover:shadow-xl hover:bg-slate-500'
          onClick={() => {
            window.open(`osucollector://tournaments/${tournament.id}`, '_blank', 'noreferrer');
          }}
        >
          Add mappool to osu
        </DialogTrigger>
        <DialogContent onPointerDownOutside={() => setDesktopClientOpened(false)}>
          <DialogHeader>
            <DialogTitle>Collection launched in osu!Collector desktop client!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Don&apos;t have the desktop client installed?{' '}
            <Link href='/client' className='font-semibold hover:underline text-gray-50'>
              Click here
            </Link>{' '}
            to download it.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  ) : (
    <div className='flex w-full'>
      <Dialog
        open={previewOpened}
        onOpenChange={(open) => {
          setPreviewOpened(open);
          resetPreviewModalState();
        }}
      >
        <DialogTrigger className='w-full p-3 text-center transition rounded rounded-r-none bg-slate-600 hover:shadow-xl hover:bg-slate-500'>
          Add mappool to osu
        </DialogTrigger>
        <DialogContent className='max-w-5xl' onPointerDownOutside={() => setPreviewOpened(false)}>
          <DesktopFeaturePreviewOverlay visible={overlayVisible} />
          <DialogHeader>
            <DialogTitle className='text-slate-500'>Import mappool collections (preview)</DialogTitle>
          </DialogHeader>
          <DialogDescription style={{ pointerEvents: overlayVisible ? 'none' : 'all' }}>
            <div className='grid' style={{ height: 'calc(100dvh - 180px)', gridTemplateColumns: '3fr 7fr' }}>
              <div>
                <div className='mb-3 text-xl text-white'>Import Method</div>
                {(() => {
                  const item = (importMethod: ImportMethod, label: string) => (
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value={importMethod} id={importMethod} />
                      <Label htmlFor={importMethod}>{label}</Label>
                    </div>
                  );
                  return (
                    <RadioGroup
                      value={importMethod}
                      className='mb-4'
                      onValueChange={(v: ImportMethod) => setImportMethod(v)}
                    >
                      {item(ImportMethod.SingleCollection, 'One single collection')}
                      {item(ImportMethod.GroupByRound, 'Group by round')}
                      {item(ImportMethod.GroupByMod, 'Group by mod')}
                      {item(ImportMethod.OneCollectionPerBeatmap, 'One collection per beatmap')}
                    </RadioGroup>
                  );
                })()}
                <Button size='lg' variant='important' onClick={() => setOverlayVisible(true)}>
                  Import to osu!
                </Button>
              </div>
              <div className='flex flex-col' style={{ height: 'inherit' }}>
                <div className='mb-3 text-xl text-white'>
                  Preview{' '}
                  <span className='text-slate-500'>
                    {previewCollections.length} collection{s(previewCollections.length)} to be imported
                  </span>
                </div>
                {(() => {
                  const row = (collection, i) => (
                    <div key={i} className='w-full px-4 py-2 rounded bg-slate-700'>
                      {collection.name}
                      <span className='ml-3 text-slate-500'>
                        {collection.beatmaps.length} beatmap{s(collection.beatmaps.length)}
                      </span>
                    </div>
                  );
                  return <div className='flex flex-col gap-2 pr-2 overflow-y-auto'>{previewCollections.map(row)}</div>;
                })()}
              </div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const getMappoolCollections = (tournament: Tournament, importMethod: ImportMethod) => {
  if (!tournament) return null;
  const tournamentCollection = [
    {
      name: tournament?.name,
      beatmaps: tournament?.rounds?.map((round) => round.mods.map((mod) => mod.maps))?.flat(2),
    },
  ];

  const roundCollections = tournament?.rounds
    .map((round) => {
      const beatmaps = round.mods.map((mod) => mod.maps);
      return {
        name: tournament.name + ' - ' + round.round,
        beatmaps: beatmaps.flat(1),
      };
    })
    .map((collection, i) => ({
      ...collection,
      name: collection.name.replace(
        tournament.name + ' - ',
        tournament.name + ` - ${(i + 1).toString().padStart(3, '0')}. `,
      ),
    }));

  const modCollections = tournament?.rounds
    .map((round) => {
      const collections = round.mods.map((mod) => ({
        name: tournament.name + ' - ' + round.round + ': ' + mod.mod,
        beatmaps: mod.maps,
      }));
      return collections;
    })
    .flat(1)
    .map((collection, i) => ({
      ...collection,
      name: collection.name.replace(
        tournament.name + ' - ',
        tournament.name + ` - ${(i + 1).toString().padStart(3, '0')}. `,
      ),
    }));

  const beatmapCollections = tournament?.rounds
    .map((round) => {
      const collections = round.mods.map((mod) =>
        mod.maps.map((beatmap, index) => ({
          name: tournament.name + ' - ' + round.round + ': ' + mod.mod + (index + 1),
          beatmaps: [beatmap],
        })),
      );
      return collections;
    })
    .flat(2)
    .map((collection, i) => ({
      ...collection,
      name: collection.name.replace(
        tournament.name + ' - ',
        tournament.name + ` - ${(i + 1).toString().padStart(3, '0')}. `,
      ),
    }));

  const collectionsGroupedBy = {
    [ImportMethod.SingleCollection]: tournamentCollection,
    [ImportMethod.GroupByRound]: roundCollections,
    [ImportMethod.GroupByMod]: modCollections,
    [ImportMethod.OneCollectionPerBeatmap]: beatmapCollections,
  };
  return collectionsGroupedBy[importMethod];
};
