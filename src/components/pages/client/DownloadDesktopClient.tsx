'use client';
import { Button } from '@/components/shadcn/button';
import useSubmit from '@/hooks/useSubmit';
import * as api from '@/services/osu-collector-api';
import { useUser } from '@/services/osu-collector-api-hooks';
import { Apple, Ubuntu, Tux, Windows } from 'react-bootstrap-icons';

export interface DownloadDesktopClientProps {}
export default function DownloadDesktopClient({}: DownloadDesktopClientProps) {
  const { user } = useUser();

  const downloadInstaller = (platform: api.Platform) => async () => {
    const installerURL = await api.getInstallerURL(platform);
    open(installerURL);
  };
  const [downloadExe, downloadingExe] = useSubmit(downloadInstaller('windows'));
  const [downloadDeb, downloadingDeb] = useSubmit(downloadInstaller('deb'));
  const [downloadFlatpak, downloadingFlatpak] = useSubmit(downloadInstaller('flatpak'));
  const [downloadMac, downloadingMac] = useSubmit(downloadInstaller('mac'));

  const buttonProps = {
    className: 'bg-[#162032]',
    variant: 'important' as const,
    disabled: !user?.paidFeaturesAccess,
  };

  return (
    <div className='w-full max-w-6xl p-6 rounded bg-slate-600'>
      <div className='mb-2'>
        <h2 className='text-2xl font-semibold text-slate-50 whitespace-nowrap' id='download-links'>
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
        <Button {...buttonProps} onClick={downloadExe} loading={downloadingExe}>
          {!downloadingExe && <Windows className='mr-2' />}
          Windows x64
        </Button>
        <Button {...buttonProps} onClick={downloadMac} loading={downloadingMac}>
          {!downloadingMac && <Apple className='mr-2' />}
          Mac Silicon
        </Button>
      </div>
      <hr className='border-slate-500 my-2' />
      <div className='flex gap-2'>
        <Button {...buttonProps} onClick={downloadDeb} loading={downloadingDeb}>
          {!downloadingDeb && <Ubuntu className='mr-2' />}
          Linux x64 .deb
        </Button>
        <Button {...buttonProps} onClick={downloadFlatpak} loading={downloadingFlatpak}>
          {!downloadingFlatpak && <Tux className='mr-2' />}
          Linux x64 Flatpak
        </Button>
      </div>
    </div>
  );
}
