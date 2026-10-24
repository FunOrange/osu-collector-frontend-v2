import { Channel } from '@/app/electron/ipc-types';
import { OsuClient, Preferences } from '@/app/electron/preferences';
import { osuClientNames } from '@/app/electron/useImportTarget';
import { useOsuClients } from '@/app/electron/useOsuClients';
import { Button } from '@/components/shadcn/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/shadcn/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/radio-group';
import useSubmit from '@/hooks/useSubmit';
import { cn } from '@/utils/shadcn-utils';
import { swrKeyIncludes } from '@/utils/swr-utils';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';

async function savePreferences(preferences: Preferences) {
  await window.ipc.setPreferences(preferences);
  mutate(swrKeyIncludes(Channel.GetPreferences));
  mutate(swrKeyIncludes(Channel.GetOsuClients));
  mutate(swrKeyIncludes(Channel.GetDownloadDirectory));
  mutate(swrKeyIncludes(Channel.PathExists));
}

/** Asks which game the user plays, until they have picked one. */
export function ElectronChooseGameDialog() {
  const { supported, info } = useOsuClients();
  const { data: preferences } = useSWR(Channel.GetPreferences, () => window.ipc?.getPreferences());
  const stableFound = Boolean(info?.stable.detectedDirectory || preferences?.osuInstallDirectory);
  const lazerFound = Boolean(info?.lazer.found);
  const [selected, setSelected] = useState<OsuClient | undefined>();
  // preselect the game if only one is installed
  const preselected = stableFound !== lazerFound ? (stableFound ? 'stable' : 'lazer') : undefined;
  const choice = selected ?? preselected;

  const [confirm, confirming] = useSubmit(async () => {
    if (!choice || !preferences) return;
    await savePreferences({ ...preferences, osuClient: choice });
  });

  const open = supported && Boolean(info) && Boolean(preferences) && !preferences?.osuClient;
  const status = (found: boolean) =>
    found ? (
      <span className='text-xs text-green-400'>✓ Found on this computer</span>
    ) : (
      <span className='text-xs text-slate-500'>Not found on this computer</span>
    );

  return (
    <Dialog open={open}>
      <DialogContent
        // a game must be chosen, so hide the close button
        className='[&>button:last-child]:hidden'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle>Which osu! do you play?</DialogTitle>
        <DialogDescription>
          osu!Collector will add collections and maps to this game. You can change this later in settings.
        </DialogDescription>
        <RadioGroup value={choice ?? ''} onValueChange={(value) => setSelected(value as OsuClient)} className='gap-3'>
          {(['lazer', 'stable'] as const).map((client) => (
            <label
              key={client}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded border p-3 transition-colors',
                choice === client ? 'border-slate-400 bg-slate-800' : 'border-white/10 hover:bg-slate-800/50',
              )}
            >
              <RadioGroupItem value={client} />
              <div className='flex flex-col'>
                <span className='text-sm text-white'>{osuClientNames[client]}</span>
                {status(client === 'lazer' ? lazerFound : stableFound)}
              </div>
            </label>
          ))}
        </RadioGroup>
        <Button variant='important' disabled={!choice} loading={confirming} onClick={confirm}>
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Shown to users who chose osu! stable, but bring osu!Collector collections into osu!lazer, eg. with
 * osu!lazer's "import from stable" feature, which was the recommended workflow before.
 */
export function LazerSuggestionBanner() {
  const { info } = useOsuClients();
  const { data: preferences } = useSWR(Channel.GetPreferences, () => window.ipc?.getPreferences());
  const [respond, responding] = useSubmit(async (switchToLazer: boolean) => {
    if (!preferences) return;
    await savePreferences(
      switchToLazer ? { ...preferences, osuClient: 'lazer' } : { ...preferences, lazerSuggestionDismissed: true },
    );
  });

  if (!info?.suggestSwitchToLazer || !preferences) return null;
  return (
    <div className='flex flex-wrap items-center gap-3 bg-blue-950 px-4 py-3 text-sm text-slate-200'>
      <div className='min-w-[300px] flex-1'>
        Looks like you bring collections into osu!lazer using its import from osu! stable feature. osu!Collector can now
        add collections and maps to osu!lazer directly.
      </div>
      <div className='flex gap-2'>
        <Button size='sm' variant='important' disabled={responding} onClick={() => respond(true)}>
          Switch to osu!lazer
        </Button>
        <Button size='sm' variant='outline' disabled={responding} onClick={() => respond(false)}>
          Keep using osu! stable
        </Button>
      </div>
    </div>
  );
}
