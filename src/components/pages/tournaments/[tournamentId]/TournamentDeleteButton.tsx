"use client";
import DownloadPreviewModal from "@/components/DownloadPreviewModal";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { Tournament } from "@/entities/Tournament";
import useSubmit from "@/hooks/useSubmit";
import { useUser } from "@/services/osu-collector-api-hooks";
import { DialogClose } from "@radix-ui/react-dialog";
import * as api from "@/services/osu-collector-api";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface TournamentDeleteButtonProps {
  tournament: Tournament;
}
export default function TournamentDeleteButton({ tournament }: TournamentDeleteButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const [deleteTournament, deleting] = useSubmit(async () => {
    await api.deleteTournament(tournament.id);
    setTournamentDeleted(true);
    setShowConfirmation(false);
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tournamentDeleted, setTournamentDeleted] = useState(false);

  if (tournament.uploader.id === user?.id) {
    return (
      <>
        <Dialog open={showConfirmation} onOpenChange={(open) => setShowConfirmation(open)}>
          <DialogTrigger className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-rose-800">
            Delete tournament
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you wish to delete this tournament?</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <DialogClose>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={deleteTournament} loading={deleting}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={tournamentDeleted} onOpenChange={(open) => setTournamentDeleted(open)}>
          <DialogContent onPointerDownOutside={() => router.push("/tournaments")}>
            <DialogHeader>
              <DialogTitle>Tournament successfully deleted.</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex px-4 py-3 transition-colors rounded bg-slate-700 hover:bg-slate-600"
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
