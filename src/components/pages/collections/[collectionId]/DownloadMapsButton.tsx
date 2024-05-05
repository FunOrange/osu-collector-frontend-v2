"use client";
import DownloadPreviewModal from "@/components/DownloadPreviewModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { Collection } from "@/entities/Collection";
import { useUser } from "@/services/osu-collector-api-hooks";
import Link from "next/link";
import { useState } from "react";

export interface DownloadMapsButtonProps {
  collection: Collection;
}
export default function DownloadMapsButton({ collection }: DownloadMapsButtonProps) {
  const { user } = useUser();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [clientOpened, setClientOpened] = useState(false);
  if (user?.paidFeaturesAccess) {
    return (
      <Dialog open={clientOpened} onOpenChange={(open) => setClientOpened(open)}>
        <DialogTrigger
          className="w-full p-3 text-center transition rounded bg-slate-600 hover:shadow-xl hover:bg-slate-500"
          onClick={() => {
            window.open(`osucollector://collections/${collection.id}`, "_blank", "noreferrer");
            setClientOpened(true);
          }}
        >
          Download maps
        </DialogTrigger>
        <DialogContent onPointerDownOutside={() => setClientOpened(false)}>
          <DialogHeader>
            <DialogTitle>Collection launched in osu!Collector desktop client!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Don&apos;t have the desktop client installed?{" "}
            <Link href="/client" className="font-semibold hover:underline text-gray-50">
              Click here{/* TODO: link directly to download */}
            </Link>{" "}
            to download it.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  } else {
    return (
      <Dialog open={previewOpen}>
        <DialogTrigger
          className="w-full p-3 text-center transition rounded bg-slate-600 hover:shadow-xl hover:bg-slate-500"
          onClick={() => setPreviewOpen(true)}
        >
          Download maps
        </DialogTrigger>
        <DownloadPreviewModal
          collection={collection}
          open={previewOpen}
          close={() => setPreviewOpen(false)}
        />
      </Dialog>
    );
  }
}
