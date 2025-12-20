import { permanentRedirect } from 'next/navigation';

// redirect to /app
export default function Page() {
  permanentRedirect('/app');
}
