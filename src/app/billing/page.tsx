import Billing from '@/components/pages/billing/Billing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing | osu!Collector',
  description: 'Find osu! beatmap collections and tournaments',
};

export default function BillingPage({}: BillingPageProps) {
  return <Billing />;
}
