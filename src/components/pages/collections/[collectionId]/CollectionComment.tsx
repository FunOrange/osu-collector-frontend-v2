"use client";
import CollectionCommentLikeButton from "@/components/pages/collections/[collectionId]/CollectionCommentLikeButton";
import { Comment } from "@/entities/Collection";
import { useUser } from "@/services/osu-collector-api-hooks";
import moment from "moment";
import Image from "next/image";
import * as api from "@/services/osu-collector-api";
import useSubmit from "@/hooks/useSubmit";
import { useRouter } from "next/navigation";

export interface CollectionCommentProps {
  collectionId: number;
  comment: Comment;
}
export default function CollectionComment({ comment, collectionId }: CollectionCommentProps) {
  const { user } = useUser();
  const router = useRouter();
  const [deleteComment, deleting] = useSubmit(async () => {
    await api.deleteComment(collectionId, comment.id);
    router.refresh();
  });
  return (
    <div className="flex">
      <div className="flex items-start justify-start gap-3 px-4 py-1 mt-1">
        <Image
          className="mt-2 rounded-full"
          src={`https://a.ppy.sh/${comment.userId}`}
          width={42}
          height={42}
          alt={"Collection uploader avatar"}
        />
        <div className="flex flex-col items-start">
          <div className="text-sm text-slate-500 whitespace-nowrap">
            {comment.username} - {moment.unix(comment.date._seconds).fromNow()}
            {user?.id === comment.userId && (
              <>
                {" "}
                -{" "}
                <span
                  className="cursor-pointer text-rose-400 hover:underline"
                  onClick={deleteComment}
                >
                  {deleting ? "..." : "delete"}
                </span>
              </>
            )}
          </div>
          <div className="text-sm whitespace-pre">{comment.message}</div>
          <div className="mt-1">
            <CollectionCommentLikeButton collectionId={collectionId} comment={comment} />
          </div>
        </div>
      </div>
    </div>
  );
}
