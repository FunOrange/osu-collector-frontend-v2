'use client';
import { useState } from 'react';
import { mutate } from 'swr';
import { Channel } from '@/app/electron/ipc-types';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { useToast } from '@/components/shadcn/use-toast';

// Accepts any of the following and converts it to an osucollector:// URI:
//   https://osucollector.com/collections/123/some-slug?stars=4,6
//   osucollector.com/tournaments/45
//   osucollector://collections/123?stars=4,6
export function toOsuCollectorURI(input: string): string | undefined {
  const match = input
    .trim()
    .match(
      /^(?:osucollector:\/\/|(?:https?:\/\/)?(?:www\.)?osucollector\.com\/)(collections|tournaments)\/(\d+)[^?#]*(\?[^#]*)?/i,
    );
  if (!match) return undefined;
  const [, type, id, search] = match;
  return `osucollector://${type.toLowerCase()}/${id}${search ?? ''}`;
}

// Fallback for when the osucollector:// URI handler doesn't work (eg. protocol not registered, browser blocks it).
// Feeds the URI directly into the same SWR cache that the import dialogs listen to.
export default function ElectronOpenURLForm() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');

  const submit = () => {
    const uri = toOsuCollectorURI(url);
    if (!uri) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a collection or tournament URL, eg. https://osucollector.com/collections/123',
        variant: 'destructive',
      });
      return;
    }
    mutate(Channel.GetURI, uri, { revalidate: false });
    setUrl('');
  };

  return (
    <form
      className='flex items-center gap-2'
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder='Paste a collection URL here...'
        className='h-8 w-80 py-1'
      />
      <Button
        type='submit'
        size='sm'
        variant='outline'
        className='h-8 text-slate-400 hover:bg-slate-500/30'
        disabled={!url}
      >
        Add
      </Button>
    </form>
  );
}
