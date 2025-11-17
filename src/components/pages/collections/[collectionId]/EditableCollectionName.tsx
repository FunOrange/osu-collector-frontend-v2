'use client';
import { Input } from '@/components/shadcn/input';
import { Collection } from '@/shared/entities/v1/Collection';
import { useUser } from '@/services/osu-collector-api-hooks';
import { useState } from 'react';
import * as api from '@/services/osu-collector-api';
import { useToast } from '@/components/shadcn/use-toast';
import { cn } from '@/utils/shadcn-utils';

export interface EditableCollectionNameProps {
  collection: Collection;
  className?: string;
}
export default function EditableCollectionName({ collection, className }: EditableCollectionNameProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [editing, setEditing] = useState(false);

  const [collectionName, setCollectionName] = useState(collection.name);
  const [userInput, setUserInput] = useState<string | undefined>();
  const value = userInput ?? collectionName;
  const renameCollection = () => {
    if (userInput && userInput !== collectionName) {
      api.renameCollection(collection.id, userInput);
      setCollectionName(userInput);
      toast({ title: 'Collection successfully updated' });
    }
    setEditing(false);
    setUserInput(undefined);
  };

  const isOwner = collection.uploader.id === user?.id;
  if (isOwner && editing) {
    return (
      <Input
        className='py-1 mb-2 text-4xl'
        value={value}
        onChange={(e) => setUserInput(e.target.value)}
        autoFocus
        onBlur={renameCollection}
        onKeyDown={(e) => {
          if (e.key === 'Enter') renameCollection();
        }}
      />
    );
  } else if (isOwner && !editing) {
    return (
      <h1
        className='px-2 py-1 mb-2 text-2xl sm:text-4xl rounded cursor-pointer hover:bg-slate-700'
        onClick={() => setEditing(true)}
      >
        {collectionName}
      </h1>
    );
  } else if (!isOwner) {
    return <h1 className={cn('mb-2 text-2xl sm:text-4xl text-gray-100', className)}>{collection.name}</h1>;
  }
}
