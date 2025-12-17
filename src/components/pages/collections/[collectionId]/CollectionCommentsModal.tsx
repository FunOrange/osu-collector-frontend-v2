'use client';
import CollectionComment from '@/components/pages/collections/[collectionId]/CollectionComment';
import YouMustBeLoggedIn from '@/components/YouMustBeLoggedIn';
import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import { Textarea } from '@/components/shadcn/textarea';
import { Collection } from '@/shared/entities/v1/Collection';
import useSubmit from '@/hooks/useSubmit';
import { useUser } from '@/services/osu-collector-api-hooks';
import { ReactNode, useState } from 'react';
import * as api from '@/services/osu-collector-api';
import { useRouter } from 'next/navigation';

export interface CollectionCommentsModalProps {
  collection: Collection;
  children: ReactNode;
  className?: string;
}
export default function CollectionCommentsModal({ collection, children, className }: CollectionCommentsModalProps) {
  const { user } = useUser();
  const router = useRouter();
  const [userInput, setUserInput] = useState('');
  const [submit, submitting] = useSubmit(async () => {
    await api.postComment(collection.id, userInput);
    setUserInput('');
    router.refresh();
  });
  return (
    <Dialog>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent className='flex max-w-4xl flex-col gap-0'>
        <DialogHeader>
          <DialogTitle className='mb-2'>Comments ({collection.comments?.length || 0})</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-3' style={{ height: '60vh', overflow: 'auto' }}>
          {collection.comments
            ?.sort((a, b) => b.date._seconds - a.date._seconds)
            ?.map((comment, i) => (
              <CollectionComment comment={comment} collectionId={collection.id} key={i} />
            ))}
        </div>
        <div className='mt-4'>
          <h3 className='mb-3 text-xl font-semibold'>Leave a comment</h3>
          <Textarea
            placeholder='Type your message here.'
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <div className='mt-2 flex justify-end'>
            {user ? (
              <Button onClick={submit} loading={submitting} disabled={!userInput.trim()}>
                Submit
              </Button>
            ) : (
              <YouMustBeLoggedIn>
                <Button>Submit</Button>
              </YouMustBeLoggedIn>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
