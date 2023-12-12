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
import { useState } from "react";

export interface AddToOsuButtonProps {
  collection: Collection;
}
export default function AddToOsuButton({ collection }: AddToOsuButtonProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  return user ? (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger>
        <button
          onClick={() => {
            window.open(`osucollector://collections/${collection.id}`, "_blank", "noreferrer");
            setOpen(true);
          }}
          className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600"
        >
          Add to osu
        </button>
      </DialogTrigger>
      <DialogContent onPointerDownOutside={() => setOpen(false)}>
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
  ) : (
    <Link
      href="/client"
      className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600"
    >
      Add to osu
    </Link>
  );
}
