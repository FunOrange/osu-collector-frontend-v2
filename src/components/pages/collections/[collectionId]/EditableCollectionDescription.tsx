'use client';
import { Collection } from '@/entities/Collection';
import { useUser } from '@/services/osu-collector-api-hooks';
import { useState } from 'react';
import * as api from '@/services/osu-collector-api';
import { Textarea } from '@/components/shadcn/textarea';
import { match } from 'ts-pattern';
import { cn } from '@/utils/shadcn-utils';
import { useToast } from '@/components/shadcn/use-toast';

export interface EditableCollectionDescriptionProps {
  collection: Collection;
}
export default function EditableCollectionDescription({ collection }: EditableCollectionDescriptionProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [editing, setEditing] = useState(false);

  const [collectionDescription, setCollectionDescription] = useState(collection.description);
  const [userInput, setUserInput] = useState<string>(undefined);
  const value = userInput ?? collectionDescription;
  const editDescription = () => {
    if (userInput !== undefined && userInput !== collectionDescription) {
      api.editCollectionDescription(collection.id, userInput);
      setCollectionDescription(userInput);
      toast({ title: 'Collection successfully updated' });
    }
    setEditing(false);
    setUserInput(undefined);
  };

  const conditions = {
    isUploader: collection.uploader.id === user?.id,
    editing,
    hasDescription: Boolean(collectionDescription?.trim()),
  };
  return match(conditions)
    .with({ isUploader: false, editing: false, hasDescription: true }, () => (
      <div className='px-3 py-2 whitespace-pre-wrap rounded bg-slate-800' style={{ minHeight: '88px' }}>
        <div>{collection.description}</div>
      </div>
    ))
    .with({ isUploader: false, editing: false, hasDescription: false }, () => (
      <div className='p-4 rounded bg-slate-800' style={{ minHeight: '88px' }}>
        <div className='text-sm text-slate-500'>No description</div>
      </div>
    ))
    .with({ isUploader: true, editing: false, hasDescription: true }, () => (
      <div
        className={cn('px-3 py-2 whitespace-pre-wrap rounded bg-slate-800', 'cursor-pointer hover:bg-slate-600')}
        style={{ minHeight: '208px' }}
        onClick={() => setEditing(true)}
      >
        <div>{collectionDescription}</div>
      </div>
    ))
    .with({ isUploader: true, editing: false, hasDescription: false }, () => (
      <div
        className={cn('p-4 rounded bg-slate-800', 'cursor-pointer hover:bg-slate-600')}
        style={{ minHeight: '208px' }}
        onClick={() => setEditing(true)}
      >
        <div className='text-sm text-slate-500'>No description</div>
      </div>
    ))
    .with({ isUploader: true, editing: true }, () => (
      <Textarea
        placeholder='Type your message here.'
        className='text-md'
        value={value}
        onChange={(e) => setUserInput(e.target.value)}
        autoFocus
        onBlur={editDescription}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            editDescription();
          }
        }}
        style={{ minHeight: '208px' }}
      />
    ))
    .with({ isUploader: false, editing: true }, () => undefined)
    .exhaustive();
}
