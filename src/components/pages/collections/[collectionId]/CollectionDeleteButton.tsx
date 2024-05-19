'use client';
import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import { Collection } from '@/entities/Collection';
import useSubmit from '@/hooks/useSubmit';
import { useUser } from '@/services/osu-collector-api-hooks';
import { DialogClose } from '@radix-ui/react-dialog';
import * as api from '@/services/osu-collector-api';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface CollectionDeleteButtonProps {
  collection: Collection;
}
export default function CollectionDeleteButton({ collection }: CollectionDeleteButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const [deleteCollection, deleting] = useSubmit(async () => {
    await api.deleteCollection(collection.id);
    setCollectionDeleted(true);
    setShowConfirmation(false);
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [collectionDeleted, setCollectionDeleted] = useState(false);

  if (collection.uploader.id === user?.id) {
    return (
      <>
        <Dialog open={showConfirmation} onOpenChange={(open) => setShowConfirmation(open)}>
          <DialogTrigger className='w-full p-3 text-center transition rounded bg-slate-600 hover:shadow-xl hover:bg-rose-800'>
            Delete collection
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you wish to delete this collection?</DialogTitle>
            </DialogHeader>
            <div className='flex items-center gap-2'>
              <DialogClose>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button variant='destructive' onClick={deleteCollection} loading={deleting}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={collectionDeleted} onOpenChange={(open) => setCollectionDeleted(open)}>
          <DialogContent onPointerDownOutside={() => router.push('/')}>
            <DialogHeader>
              <DialogTitle>Collection successfully deleted.</DialogTitle>
            </DialogHeader>
            <div className='flex items-center gap-2'>
              <Link
                href='/'
                className='inline-flex px-4 py-3 transition-colors rounded bg-slate-600 hover:bg-slate-600'
              >
                Back to home
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  } else {
    return undefined;
  }
}
