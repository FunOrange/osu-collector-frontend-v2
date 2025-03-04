'use client';
import UploadCollectionModal from '@/components/UploadCollectionModal';
import YouMustBeLoggedIn from '@/components/YouMustBeLoggedIn';
import { Button } from '@/components/shadcn/button';
import { useUser } from '@/services/osu-collector-api-hooks';
import { useState } from 'react';
import { CloudUploadFill, MusicNoteList, Trophy } from 'react-bootstrap-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shadcn/dialog';
import Link from 'next/link';
import { cn } from '@/utils/shadcn-utils';

export interface UploadButtonProps {
  className?: string;
}
export default function UploadButton({ className }: UploadButtonProps) {
  const { user } = useUser();
  const [makingSelection, setMakingSelection] = useState(false);
  const [uploadingCollection, setUploadingCollection] = useState(false);

  if (!user) {
    return (
      <YouMustBeLoggedIn>
        <Button variant='important' className={cn('gap-2', className)}>
          <CloudUploadFill size={20} className='mt-1' />
          Upload
        </Button>
      </YouMustBeLoggedIn>
    );
  } else if (user) {
    return (
      <>
        <Dialog open={makingSelection} onOpenChange={setMakingSelection}>
          <DialogTrigger className={className}>
            <Button variant='important' className='gap-2' asChild>
              <div>
                <CloudUploadFill size={20} className='mt-1' />
                Upload
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle className='mb-2 text-center'>What would you like to upload?</DialogTitle>
            </DialogHeader>

            <div className='grid grid-cols-2 gap-x-4'>
              <button
                className='px-4 transition-colors border py-14 rounded-xl hover:bg-slate-600'
                onClick={() => {
                  setMakingSelection(false);
                  setUploadingCollection(true);
                }}
              >
                <MusicNoteList className='inline mb-2' size={48} />
                <h2 className='text-xl font-semibold'>Collection</h2>
              </button>

              <Link href='/tournaments/upload' onClick={() => setMakingSelection(false)}>
                <button className='w-full px-4 transition-colors border py-14 rounded-xl hover:bg-slate-600'>
                  <Trophy className='inline mb-2' size={48} />
                  <h2 className='text-xl font-semibold'>Tournament Mappool</h2>
                </button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>

        <UploadCollectionModal open={uploadingCollection} onOpenChange={setUploadingCollection} />
      </>
    );
  }
}
