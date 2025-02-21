'use client';
import { Collection } from '@/shared/entities/v1/Collection';
import { ChatFill } from 'react-bootstrap-icons';
import * as api from '@/services/osu-collector-api';
import { useUser } from '@/services/osu-collector-api-hooks';
import { match } from 'ts-pattern';
import CollectionComment from '@/components/pages/collections/[collectionId]/CollectionComment';
import YouMustBeLoggedIn from '@/components/YouMustBeLoggedIn';
import CollectionCommentsModal from '@/components/pages/collections/[collectionId]/CollectionCommentsModal';
import { useState } from 'react';

export interface CollectionCommentsSectionProps {
  collection: Collection;
}
export default function CollectionCommentsSection({ collection }: CollectionCommentsSectionProps) {
  const { user } = useUser();
  const isLoggedIn = Boolean(user);
  const hasComments = Boolean(collection?.comments?.length > 0);

  return (
    <>
      {match({ hasComments, isLoggedIn })
        .with({ hasComments: true }, () => (
          <div className='w-full rounded border-slate-900 shadow-inner bg-[#162032]'>
            <CollectionComment
              collectionId={collection.id}
              comment={collection.comments.sort((a, b) => b.upvotes.length - a.upvotes.length)[0]}
            />
            <CollectionCommentsModal
              collection={collection}
              className='flex items-center justify-center w-full gap-2 py-3 text-center rounded cursor-pointer border-slate-900 shadow-inner bg-[#162032] hover:bg-slate-700'
            >
              <div>
                View {collection.comments.length === 1 ? '' : 'all'} {collection.comments.length} comment
                {collection.comments.length === 1 ? '' : 's'}
              </div>
            </CollectionCommentsModal>
          </div>
        ))
        .with({ hasComments: false, isLoggedIn: true }, () => (
          <CollectionCommentsModal
            collection={collection}
            className='flex items-center justify-center w-full gap-2 py-3 text-center rounded cursor-pointer border-slate-900 shadow-inner bg-[#162032] hover:bg-slate-700'
          >
            <ChatFill size={20} />
            No comments. Be the first to leave a comment!
          </CollectionCommentsModal>
        ))
        .with({ hasComments: false, isLoggedIn: false }, () => (
          <YouMustBeLoggedIn>
            <div className='flex items-center justify-center gap-2 p-4 text-center rounded cursor-pointer text-slate-500 border-slate-900 shadow-inner bg-[#162032] hover:bg-slate-700'>
              <ChatFill size={20} />
              No comments. Be the first to leave a comment!
            </div>
          </YouMustBeLoggedIn>
        ))
        .exhaustive()}
    </>
  );
}
