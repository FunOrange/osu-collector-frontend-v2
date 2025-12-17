'use client';
import CollectionCommentLikeButton from '@/components/pages/collections/[collectionId]/CollectionCommentLikeButton';
import { Comment } from '@/shared/entities/v1/Collection';
import { useUser } from '@/services/osu-collector-api-hooks';
import moment from 'moment';
import Image from 'next/image';
import * as api from '@/services/osu-collector-api';
import useSubmit from '@/hooks/useSubmit';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/utils/shadcn-utils';

export interface CollectionCommentProps {
  collectionId: number;
  comment: Comment;
  preview?: boolean;
}
export default function CollectionComment({ comment, collectionId, preview }: CollectionCommentProps) {
  const { user } = useUser();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteComment] = useSubmit(async () => {
    setDeleting(true);
    try {
      await api.deleteComment(collectionId, comment.id);
      router.refresh();
    } catch (e) {
      setDeleting(false);
      throw e;
    }
  });
  return (
    <div className='flex'>
      <div className='mt-1 flex items-start justify-start gap-3 px-4 py-1'>
        <Image
          className='mt-2 rounded-full'
          src={`https://a.ppy.sh/${comment.userId}`}
          width={42}
          height={42}
          alt={'Collection uploader avatar'}
        />
        <div className='flex flex-col items-start'>
          <div className='whitespace-nowrap text-sm text-slate-500'>
            {comment.username} - {moment.unix(comment.date._seconds).fromNow()}
            {user?.id === comment.userId && (
              <>
                {' '}
                -{' '}
                <span className='cursor-pointer text-rose-400 hover:underline' onClick={deleteComment}>
                  {deleting ? '...' : 'delete'}
                </span>
              </>
            )}
          </div>
          <div className={cn('whitespace-pre-wrap text-sm', preview && 'line-clamp-1')}>{comment.message}</div>
          <div className='mt-1'>
            <CollectionCommentLikeButton collectionId={collectionId} comment={comment} />
          </div>
        </div>
      </div>
    </div>
  );
}
