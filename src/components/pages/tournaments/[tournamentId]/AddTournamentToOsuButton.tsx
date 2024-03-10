"use client";
import { Collection } from "@/entities/Collection";
import Link from "next/link";
import { useUser } from "@/services/osu-collector-api-hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { useState } from "react";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import * as api from "@/services/osu-collector-api";
import { useRouter } from "next/navigation";

export interface AddTournamentToOsuButtonProps {
  tournament: Collection;
}
export default function AddTournamentToOsuButton({ tournament }: AddTournamentToOsuButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [desktopClientOpened, setDesktopClientOpened] = useState(false);
  const [previewOpened, setPreviewOpened] = useState(false);

  return user ? (
    <div className="flex w-full">
      <Dialog open={desktopClientOpened} onOpenChange={(open) => setDesktopClientOpened(open)}>
        <DialogTrigger
          className="w-full p-3 text-center transition rounded rounded-r-none bg-slate-700 hover:shadow-xl hover:bg-slate-600"
          onClick={() => {
            window.open(`osucollector://tournaments/${tournament.id}`, "_blank", "noreferrer");
          }}
        >
          Add mappool to osu
        </DialogTrigger>
        <DialogContent onPointerDownOutside={() => setDesktopClientOpened(false)}>
          <DialogHeader>
            <DialogTitle>Collection launched in osu!Collector desktop client!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Don&apos;t have the desktop client installed?{" "}
            <Link href="/client" className="font-semibold hover:underline text-gray-50">
              Click here
            </Link>{" "}
            to download it.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  ) : (
    <div className="flex w-full">
      <Dialog open={previewOpened} onOpenChange={(open) => setPreviewOpened(open)}>
        <DialogTrigger className="w-full p-3 text-center transition rounded rounded-r-none bg-slate-700 hover:shadow-xl hover:bg-slate-600">
          Add mappool to osu
        </DialogTrigger>
        <DialogContent onPointerDownOutside={() => setPreviewOpened(false)}>
          <DialogHeader>
            <DialogTitle>Import mappool collections (preview)</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="grid" style={{ gridTemplateColumns: "3fr 7fr" }}>
              <div></div>
              <div></div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
