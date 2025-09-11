'use client';
import { Button } from '@/components/shadcn/button';
import useSubmit from '@/hooks/useSubmit';
import * as api from '@/services/osu-collector-api';
import { useUser } from '@/services/osu-collector-api-hooks';
import { Apple, Ubuntu, Windows } from 'react-bootstrap-icons';

const flatpak = (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='1.18 0 21.65 24'>
    <path
      fill='#ffffff'
      d='M12 0c-.556 0-1.111.144-1.61.432l-7.603 4.39a3.22 3.22 0 0 0-1.61 2.788v8.78c0 1.151.612 2.212 1.61 2.788l7.603 4.39a3.22 3.22 0 0 0 3.22 0l7.603-4.39a3.22 3.22 0 0 0 1.61-2.788V7.61a3.22 3.22 0 0 0-1.61-2.788L13.61.432A3.2 3.2 0 0 0 12 0m0 2.358c.15 0 .299.039.431.115l7.604 4.39c.132.077.24.187.315.316L12 12v9.642a.86.86 0 0 1-.431-.116l-7.604-4.39a.87.87 0 0 1-.431-.746V7.61c0-.153.041-.302.116-.43L12 12Z'
    />
  </svg>
);

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
          {!downloadingFlatpak && <div className='mr-2 w-3 h-3'>{flatpak}</div>}
          Linux x64 Flatpak
        </Button>
      </div>
    </div>
  );
}
