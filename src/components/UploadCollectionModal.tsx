"use client";
import React, { ReactNode } from "react";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import useSubmit from "@/hooks/useSubmit";
import { useUser, useUserUploads } from "@/services/osu-collector-api-hooks";
import * as api from "@/services/osu-collector-api";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { useDropzone } from "react-dropzone";
import { parseCollectionDb } from "@/services/osu-collection-db";
import { getUrlSlug } from "@/utils/string-utils";
import { useToast } from "@/components/shadcn/use-toast";
import { cn } from "@/utils/shadcn-utils";
import { propertyEquals } from "@/utils/object-utils";
import { Checkbox } from "@/components/shadcn/checkbox";

export interface UploadCollectionModalProps {
  children: ReactNode;
}
export default function UploadCollectionModal({ children }: UploadCollectionModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  // #region local collection.db
  const [filename, setFilename] = useState("");
  const onDrop = useCallback((acceptedFiles: File[]) => {
    let file = acceptedFiles[0];
    setFilename(file.name);
    let reader = new FileReader();
    reader.onload = () => {
      setLocalCollections(parseCollectionDb(reader.result));
    };
    reader.readAsArrayBuffer(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const [localCollections, setLocalCollections] = useState(undefined);
  // #endregion local collection.db

  const { collections: remoteCollections } = useUserUploads(user.id);
  const isUploaded = (collection) =>
    remoteCollections?.map((c) => c.name).includes(collection?.name);

  const [selectedCollection, setSelectedCollection] = useState(undefined);

  const [uploadCollection, uploading] = useSubmit(async () => {
    if (selectedCollection.beatmapChecksums.length > 2000) {
      alert("This collection is too big (max collection size: 2000)");
      return;
    }
    const collections = await api.uploadCollections([selectedCollection]);
    router.push(`/collections/${collections[0].id}/${getUrlSlug(collections[0].name)}`);
    toast({ title: "Collection uploaded!", description: "Redirecting to collection page..." });
    setOpen(false);
  });
  const uploadDisabled = uploading || !selectedCollection;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upload your collection</DialogTitle>
        </DialogHeader>

        <div
          className="grid mt-4"
          style={{ gridTemplateRows: "auto auto 1fr auto", height: "85vh" }}
        >
          <div
            className={cn(
              "flex flex-col gap-2",
              localCollections === undefined ? undefined : "opacity-60"
            )}
          >
            <h2 className="text-2xl font-semibold">1. Open collection.db</h2>
            <div>
              collection.db is a file that contains all of your osu! collections. It is located in
              your osu! install folder. Example:
            </div>
            <code className="inline-flex items-center p-4 pl-6 space-x-4 text-sm text-left text-white bg-gray-800 rounded-lg sm:text-base">
              <span>C:\Users\jun\AppData\Local\osu!\collection.db</span>
            </code>
            <div
              className="p-8 mb-8 text-center transition border border-dashed rounded cursor-pointer border-slate-700 bg-slate-900 hover:bg-slate-600"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <span>
                {isDragActive ? "Drop the file here..." : filename || "Open collection.db..."}
              </span>
            </div>
          </div>

          {localCollections !== undefined && (
            <>
              <h2 className="mb-2 text-2xl font-semibold">
                2. Select a collection to upload or update
              </h2>
              <div className="flex flex-col overflow-auto divide-y">
                {localCollections.length === 0 && (
                  <div className="text-red-400">
                    collection.db file does not contain any collections.
                  </div>
                )}
                {localCollections.map((collection, i) => (
                  <div
                    key={i}
                    className={cn(
                      "px-4 py-2 cursor-pointer bg-slate-800 hover:bg-slate-700",
                      i === 0 ? "rounded-t-lg" : undefined,
                      i !== 0 ? "border-t-slate-700" : undefined,
                      i === localCollections.length - 1 ? "rounded-b-lg" : undefined
                    )}
                    onClick={() =>
                      setSelectedCollection((prev) =>
                        prev === collection ? undefined : collection
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        {collection.name}
                        <span className="ml-3 text-slate-500">
                          {collection.beatmapChecksums.length} beatmaps
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {isUploaded(collection) && (
                          <>
                            <span className="text-sm text-slate-500">
                              last updated{" "}
                              {moment
                                .unix(
                                  remoteCollections?.find(propertyEquals("name", collection.name))
                                    ?.dateLastModified._seconds
                                )
                                .fromNow()}
                            </span>
                            <div className="px-2 py-1 text-sm rounded bg-cyan-600">Uploaded</div>
                          </>
                        )}
                        <Checkbox checked={selectedCollection?.name === collection.name} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="important"
                className="w-full py-8 mt-4 text-xl"
                onClick={uploadCollection}
                disabled={uploadDisabled}
                loading={uploading}
              >
                Upload
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
