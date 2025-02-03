import { Button } from '@/components/shadcn/button';
import { DialogClose } from '@radix-ui/react-dialog';
import Link from 'next/link';
import styled from 'styled-components';

export interface DesktopFeaturePreviewOverlayProps {
  visible: boolean;
  onCancel: () => void;
}
export default function DesktopFeaturePreviewOverlay({ visible, onCancel }) {
  return (
    <PreviewOverlay className={visible ? undefined : 'opacity-0'}>
      <div className='horizontalStrip'>
        <h3>You are previewing an osu!Collector Desktop feature!</h3>
        <div className='flex gap-3' style={{ pointerEvents: 'all' }}>
          <DialogClose>
            <Button variant='secondary' onClick={onCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Link href='/client'>
            <Button>Get osu!Collector Desktop</Button>
          </Link>
        </div>
      </div>
    </PreviewOverlay>
  );
}

const PreviewOverlay = styled.div`
  pointer-events: none;
  transition: opacity 0.4s;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 2;
  backdrop-filter: blur(1px);
  .horizontalStrip {
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 160px;
    color: white;
    /* background: linear-gradient(
      0deg,
      rgba(2, 0, 36, 0) 0%,
      rgba(0, 0, 0, 0.8015581232492998) 20%,
      rgba(0, 0, 0, 0.8) 80%,
      rgba(0, 0, 0, 0) 100%
    ); */
    background-color: rgba(0, 0, 0, 0.8);
    -webkit-box-shadow: 0px 0px 15px 5px #000;
    box-shadow: 0px 0px 15px 5px #000;
  }
`;
