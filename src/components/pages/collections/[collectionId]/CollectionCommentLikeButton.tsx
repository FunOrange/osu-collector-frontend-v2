import YouMustBeLoggedIn from '@/components/YouMustBeLoggedIn';
import { Comment } from '@/shared/entities/v1/Collection';
import { useUser } from '@/services/osu-collector-api-hooks';
import { useState } from 'react';
import { HandThumbsUpFill } from 'react-bootstrap-icons';
import { match } from 'ts-pattern';
import * as api from '@/services/osu-collector-api';

export interface CollectionCommentLikeButtonProps {
  collectionId: number;
  comment: Comment;
}
export default function CollectionCommentLikeButton({ collectionId, comment }: CollectionCommentLikeButtonProps) {
  const { user } = useUser();
  const [localLikeOffset, setLocalLikeOffset] = useState<-1 | -0.01 | 0 | 0.01 | 1>(0);

  const onClick = () => {
    const likingComment = match(localLikeOffset)
      .with(-1, () => true)
      .with(-0.01, () => false)
      .with(0, () => !comment.upvotes.includes(user.id))
      .with(0.01, () => true)
      .with(1, () => false)
      .exhaustive();

    const remove = !likingComment;
    api.likeComment(collectionId, comment.id, remove);

    setLocalLikeOffset((localLikeOffset) =>
      match(localLikeOffset)
        .with(-1, () => -0.01 as const)
        .with(-0.01, () => -1 as const)
        .with(0, () => (!comment.upvotes.includes(user.id) ? (1 as const) : (-1 as const)))
        .with(0.01, () => 1 as const)
        .with(1, () => 0.01 as const)
        .exhaustive(),
    );
  };

  if (user) {
    return (
      <div className='flex items-center gap-1 text-sm cursor-pointer' onClick={onClick}>
        <HandThumbsUpFill
          size={14}
          className={
            (localLikeOffset === 0 && comment.upvotes.includes(user.id)) || [-0.01, 1].includes(localLikeOffset)
              ? 'text-sky-600'
              : undefined
          }
        />
        {Math.round(comment.upvotes.length + localLikeOffset)}
      </div>
    );
  } else {
    return (
      <YouMustBeLoggedIn>
        <div className='flex items-center gap-1 text-sm cursor-pointer'>
          <HandThumbsUpFill size={14} />
          {comment.upvotes.length}
        </div>
      </YouMustBeLoggedIn>
    );
  }
}
