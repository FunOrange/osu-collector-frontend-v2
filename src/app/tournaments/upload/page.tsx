'use client';
import { mappoolTemplate, parseMappool, getMappoolTextFromTournament } from '@/app/tournaments/upload/mappoolTemplate';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';
import { Textarea } from '@/components/shadcn/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn/tooltip';
import { Tournament } from '@/entities/Tournament';
import useTournamentForm from '@/hooks/forms/useTournamentForm';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/shadcn/use-toast';
import useSubmit from '@/hooks/useSubmit';
import { useRouter } from 'next/navigation';
import { createTournament } from '@/services/osu-collector-api';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/shadcn/dialog';
interface TournamentsPageProps {
  tournament?: Tournament;
}
export default function TournamentsPage({ tournament = null }: TournamentsPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const creating = tournament === null;

  const [tournamentDraft, setTournamentDraft] = useState<{
    name: string;
    link: string;
    description: string;
    organizers: number[];
    mappoolText: string;
    banner: string;
    downloadUrl: string;
  }>();
  useEffect(() => {
    if (creating) {
      const tournamentDraft = JSON.parse(localStorage.getItem('Create Tournament Draft'));
      if (tournamentDraft) {
        setTournamentDraft(tournamentDraft);
        setMappoolText(tournamentDraft?.mappoolText ?? mappoolTemplate);
        setOrganizers(tournamentDraft?.organizers ?? []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const queueSaveDraft = () => {
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const draft = {
        ...form.fields,
        organizers,
        mappoolText,
      };
      console.log('saving tournament draft: ', draft);
      localStorage.setItem('Create Tournament Draft', JSON.stringify(draft));
    }, 1000);
  };

  const form = useTournamentForm(tournament, tournamentDraft, queueSaveDraft);

  // #region organizers
  const [organizerField, setOrganizerField] = useState('');
  const [organizers, setOrganizers] = useState([]);
  const [organizerError, setOrganizerError] = useState('');
  const addOrganizer = () => {
    const organizerId = Number(organizerField);
    if (isNaN(organizerId) || !organizerId) {
      setOrganizerError('Not a valid user ID');
    } else if (organizers.includes(organizerId)) {
      setOrganizerError('This user is already an added');
    } else {
      setOrganizers((organizers) => organizers.concat(organizerId));
      setOrganizerField('');
      queueSaveDraft();
    }
  };
  // #endregion organizers

  // #region mappool definition
  const [mappoolText, setMappoolText] = useState(creating ? mappoolTemplate : getMappoolTextFromTournament(tournament));
  const [mappoolError, setMappoolError] = useState('');
  // #endregion mappool definition

  const [submit, submitting] = useSubmit(async () => {
    if (!form.validate.all()) {
      toast({
        title: 'Please fix errors and try again',
        variant: 'destructive',
      });
      window.scrollTo(0, 0);
      return;
    }
    const { rounds, error: mappoolError } = parseMappool(mappoolText);
    if (mappoolError) {
      setMappoolError('Invalid line: ' + mappoolError.line);
      toast({
        title: 'Unexpected line found in mappool template:',
        description: mappoolError.line,
        variant: 'destructive',
        duration: 10000,
      });
      return;
    }
    const createTournamentDto = {
      name: form.fields.name,
      link: form.fields.link,
      description: form.fields.description,
      organizers: organizers,
      banner: form.fields.banner,
      downloadUrl: form.fields.downloadUrl,
      rounds: rounds,
    };
    const newTournament = await createTournament(createTournamentDto);
    localStorage.removeItem('Create Tournament Draft');
    toast({ title: 'Tournament created' });
    router.push(`/tournaments/${newTournament.id}`);
  });

  return (
    <>
      <div className='flex justify-center w-full'>
        <div className='items-end w-full max-w-screen-lg m-5 gap-x-4'>
          <div className='p-4 rounded bg-slate-700 md:p-7'>
            <h1 className='mb-6 text-3xl'>{creating ? 'Create tournament' : 'Edit tournament'}</h1>
            <div className='flex flex-col mb-6 gap-y-4'>
              <div>
                <Label htmlFor='tournament-name'>Tournament name</Label>
                <Input type='text' id='tournament-name' {...form.inputProps('name')} />
              </div>
              <div>
                <Label htmlFor='tournament-link'>Tournament forum post URL </Label>
                <Input
                  type='text'
                  id='tournament-link'
                  placeholder='https://osu.ppy.sh/community/forums/topics/...'
                  {...form.inputProps('link')}
                />
              </div>
              <div>
                <Label htmlFor='banner-url'>
                  Banner URL <span className='text-sm text-slate-500'>Optional, only https://i.ppy.sh allowed</span>
                </Label>
                <Input type='text' id='banner-url' placeholder='https://i.ppy.sh/...' {...form.inputProps('banner')} />
                <div className='text-sm text-slate-500'>
                  You can get the banner URL by going to the tournament forum page, right clicking the banner image, and
                  clicking &quot;Copy image address&quot;
                </div>
              </div>
              <div>
                <Label htmlFor='mappool-download-url'>
                  Mappool Download URL <span className='text-sm text-slate-500'>Optional</span>
                </Label>
                <Input type='text' id='mappool-download-url' {...form.inputProps('downloadUrl')} />
              </div>
              <div>
                <div className='pb-1'>Tournament Organizers</div>
                <div className='flex items-start'>
                  <div className='flex items-start mr-4'>
                    <Input
                      disabled
                      value='https://osu.ppy.sh/users/'
                      className='w-[185px] pr-0 rounded-none rounded-s rounded-e-0'
                    />
                    <Input
                      placeholder='123456'
                      className='relative z-10 w-20 rounded-none'
                      value={organizerField}
                      onKeyDown={(e) => e.key === 'Enter' && addOrganizer()}
                      onChange={(e) => {
                        setOrganizerError('');
                        setOrganizerField(e.target.value);
                      }}
                      error={organizerError}
                    />
                    <Button
                      // disabled={organizerError}
                      className='border rounded-none rounded-e rounded-s-0'
                      onClick={addOrganizer}
                    >
                      Add
                    </Button>
                  </div>
                  <div className='flex items-center mr-2'>
                    {organizers.map((organizerId, i) => (
                      <TooltipProvider key={i}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger>
                            <Image
                              unoptimized
                              src={`https://a.ppy.sh/${organizerId}`}
                              alt='User profile picture'
                              width={32}
                              height={32}
                              onClick={() => {
                                setOrganizers((organizers) => organizers.filter((id) => id !== organizerId));
                                queueSaveDraft();
                              }}
                              className='transition rounded-full cursor-pointer hover:brightness-50 hover:grayscale'
                            />
                          </TooltipTrigger>
                          <TooltipContent>Remove</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
                <div className='text-sm text-slate-500'>
                  Optional: Organizers have permission to make changes to this tournament
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  // value={value}
                  // onChange={(e) => setUserInput(e.target.value)}
                  autoFocus
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>
            <div>
              <h2 className='mb-2 text-2xl'>Mappool</h2>
              <div className='text-sm text-slate-500'>
                A mappool template is provided below. Please modify it to include the maps in the tournament. To reset
                back to the default template,{' '}
                <Dialog>
                  <DialogTrigger className='text-blue-400 underline'>click here.</DialogTrigger>
                  <DialogContent>
                    <div className='text-sm text-slate-500'>
                      Are you sure you want to reset back to the default template? All data previously entered in the
                      mappool textbox will be lost.
                    </div>
                    <DialogClose asChild>
                      <Button
                        variant='destructive'
                        onClick={() => {
                          localStorage.removeItem('Create Tournament Draft');
                          setMappoolText(mappoolTemplate);
                          toast({ title: 'Mappool template reset' });
                        }}
                      >
                        Reset
                      </Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </div>
              <Textarea
                rows={mappoolText.split(/\r\n|\r|\n/).length}
                value={mappoolText}
                onChange={(e) => {
                  setMappoolError('');
                  setMappoolText(e.target.value);
                  queueSaveDraft();
                }}
                autoFocus
                style={{ minHeight: '100px' }}
                error={mappoolError}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='fixed flex bottom-4 right-9 2xl:left-[calc(50%+512px+20px)]'>
        <div className='flex flex-col p-4 border shadow-2xl bg-slate-700 gap-y-2 rounded-xl'>
          <div className='text-sm cyan-400'>Publish this tournament!</div>
          <Button variant='important' onClick={submit} loading={submitting}>
            Submit
          </Button>
        </div>
      </div>
    </>
  );
}
