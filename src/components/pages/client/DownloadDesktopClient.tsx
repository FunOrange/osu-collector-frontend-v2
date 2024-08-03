'use client';
import { Button } from '@/components/shadcn/button';
import useSubmit from '@/hooks/useSubmit';
import * as api from '@/services/osu-collector-api';
import { useUser } from '@/services/osu-collector-api-hooks';
import { Ubuntu, Windows } from 'react-bootstrap-icons';

export interface DownloadDesktopClientProps {}
export default function DownloadDesktopClient({}: DownloadDesktopClientProps) {
  const { user } = useUser();

  const [downloadWindowsInstaller, downloadingWindowsInstaller] = useSubmit(async () => {
    const installerURL = await api.getInstallerURL('win32');
    open(installerURL);
  });
  const [downloadLinuxInstaller, downloadingLinuxInstaller] = useSubmit(async () => {
    const installerURL = await api.getInstallerURL('linux');
    open(installerURL);
  });

  return (
    <div className='w-full max-w-6xl p-6 rounded bg-slate-600'>
      <div className='mb-2'>
        <h2 className='text-2xl font-semibold text-slate-50 whitespace-nowrap' id='download'>
          Download osu!Collector Desktop
        </h2>
        {user?.paidFeaturesAccess && <div className='text-pink-400'>Thank you for supporting us! You are awesome.</div>}
        {!user?.paidFeaturesAccess && (
          <div className='text-slate-400'>
            Please support us to gain access to the desktop client. See below for payment options.
          </div>
        )}
      </div>
      <div className='flex gap-2'>
        <Button
          className='bg-[#162032]'
          variant='important'
          disabled={!user?.paidFeaturesAccess}
          onClick={downloadWindowsInstaller}
          loading={downloadingWindowsInstaller}
        >
          {!downloadingWindowsInstaller && <Windows className='mr-2' />}
          Windows 64-bit
        </Button>
        <Button
          className='bg-[#162032]'
          variant='important'
          disabled={!user?.paidFeaturesAccess}
          onClick={downloadLinuxInstaller}
          loading={downloadingLinuxInstaller}
        >
          {!downloadingLinuxInstaller && <Ubuntu className='mr-2' />}
          Linux x64 .deb
        </Button>
      </div>
    </div>
  );
}
