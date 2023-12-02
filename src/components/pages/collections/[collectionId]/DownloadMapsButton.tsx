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

export interface DownloadMapsButtonProps {
  collection: Collection;
}
export default function DownloadMapsButton({ collection }: DownloadMapsButtonProps) {
  const { user } = useUser();
  if (user?.paidFeaturesAccess) {
    return (
      <Dialog>
        <DialogTrigger>
          <button
            className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600"
            onClick={() => window.open(`osucollector://collections/${collection.id}`)}
          >
            Download maps
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collection launched in osu!Collector desktop client!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Don&apos;t have the desktop client installed?
            <Link href="/client" className="font-semibold hover:underline text-gray-50">
              Click here {/* TODO: link directly to download */}
            </Link>{" "}
            to download it.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  } else {
    return (
      <Dialog>
        <DialogTrigger>
          <button className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600">
            Download maps
          </button>
        </DialogTrigger>
        <DownloadPreviewModal collection={collection} />
      </Dialog>
    );
  }
}
