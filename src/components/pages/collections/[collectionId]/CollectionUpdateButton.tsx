'use client';
import { Button } from '@/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shadcn/dialog';
import { Collection } from '@/shared/entities/v1/Collection';
import useSubmit from '@/hooks/useSubmit';
import { useUser } from '@/services/osu-collector-api-hooks';
import { DialogClose } from '@radix-ui/react-dialog';
import * as api from '@/services/osu-collector-api';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { useDropzone } from 'react-dropzone';
import { parseCollectionDb } from '@/services/osu-collection-db';
import { match } from 'ts-pattern';
import { s } from '@/utils/string-utils';
import { unorderedArrayEquals } from '@/utils/array-utils';
import { useToast } from '@/components/shadcn/use-toast';

export interface CollectionUpdateButtonProps {
  collection: Collection;
}
export default function CollectionUpdateButton({ collection: remoteCollection }: CollectionUpdateButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [showModal, setShowModal] = useState(false);

  const remoteChecksums = remoteCollection?.beatmapsets
    ?.flatMap((beatmapset) => beatmapset.beatmaps)
    .map((beatmap) => beatmap.checksum);

  // #region local collection.db
  const onDrop = useCallback((acceptedFiles) => {
    let file = acceptedFiles[0];
    let reader = new FileReader();
    reader.onload = () => {
      setLocalCollections(parseCollectionDb(reader.result));
    };
    reader.readAsArrayBuffer(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const [localCollections, setLocalCollections] = useState(null);
  const localCollection = localCollections?.find((collection) => collection.name === remoteCollection.name);
  const localCount = localCollection?.beatmapChecksums?.length;
  const remoteCount = remoteChecksums?.length;
  const localAdditions = localCollection?.beatmapChecksums?.filter(
    (checksum) => !remoteChecksums.includes(checksum),
  ).length;
  const localRemovals = remoteChecksums?.filter(
    (checksum) => !localCollection?.beatmapChecksums.includes(checksum),
  ).length;
  useEffect(() => {
    if (showModal) {
      setLocalCollections(null);
    }
  }, [showModal]);
  // #endregion local collection.db

  const isIdentical = unorderedArrayEquals(localCollection?.beatmapChecksums, remoteChecksums);
  const [upload, uploading] = useSubmit(async () => {
    await api.uploadCollections([localCollection]);
    setShowModal(false);
    toast({ title: 'Collection successfully updated' });
    router.refresh();
  });
  const uploadDisabled = !localCollection || isIdentical || uploading;

  if (remoteCollection.uploader.id === user?.id) {
    return (
      <>
        <Dialog open={showModal} onOpenChange={(open) => setShowModal(open)}>
          <DialogTrigger className='w-full p-2 text-center transition rounded bg-slate-600 hover:shadow-xl hover:bg-cyan-700'>
            <div>
              Reupload collection
              <div className='text-xs text-slate-400'>
                updated {moment(remoteCollection?.dateLastModified?._seconds * 1000).fromNow()}
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className='max-w-screen-lg'>
            <DialogHeader>
              <DialogTitle className='text-3xl'>Reupload collection: {remoteCollection.name}</DialogTitle>
            </DialogHeader>
            <div className='grid grid-cols-2 gap-8'>
              <div>
                <div className='mb-1 text-lg font-semibold'>On your computer:</div>
                {match({
                  loaded: Array.isArray(localCollections),
                  hasCollection: Boolean(localCollection),
                })
                  .with({ loaded: false }, () => (
                    <div
                      className='p-8 text-center transition border border-dashed rounded cursor-pointer border-slate-700 hover:bg-slate-600'
                      {...getRootProps()}
                    >
                      <input {...getInputProps()} />
                      <span>{isDragActive ? 'Drop the file here' : 'Open collection.db'}...</span>
                    </div>
                  ))
                  .with({ loaded: true, hasCollection: true }, () => (
                    <div className='p-4 rounded bg-slate-700'>
                      {' '}
                      <div>
                        {localCount} beatmaps {isIdentical && <span className='ml-1 text-slate-500'>(no change)</span>}
                      </div>
                      {localAdditions > 0 && <div className='text-green-500'>+{localAdditions} added beatmap(s)</div>}
                      {localRemovals > 0 && <div className='text-red-500'>-{localRemovals} removed beatmap(s)</div>}
                    </div>
                  ))
                  .with({ loaded: true, hasCollection: false }, () => (
                    <div className='p-4 rounded bg-slate-700'>
                      <div className='mb-4 font-semibold text-red-500'>
                        You do not have a collection named {remoteCollection.name}
                      </div>
                      <div>
                        Found {localCollections.length} collection{s(localCollections.length)}:
                      </div>
                      <ul className='text-sm text-slate-400'>
                        {localCollections.map((collection) => (
                          <li key={collection.name}>
                            <span className='text-cyan-500'>{collection.name}</span>{' '}
                            {collection.beatmapChecksums?.length} beatmaps
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                  .exhaustive()}
              </div>
              <div>
                <div className='mb-1 text-lg font-semibold'>On osu!Collector:</div>
                <div className='p-4 rounded bg-slate-700'>
                  <span className='mr-2'>{remoteCount} beatmaps</span>
                  <span className='text-slate-500'>
                    (updated {moment(remoteCollection?.dateLastModified?._seconds * 1000).fromNow()})
                  </span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <DialogClose>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button variant='important' onClick={upload} loading={uploading} disabled={uploadDisabled}>
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  } else {
    return undefined;
  }
}
