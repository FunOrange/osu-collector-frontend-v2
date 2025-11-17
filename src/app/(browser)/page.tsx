import Home from '@/components/pages/Home';
import { getMetadata, getPopularCollections, getRecentCollections } from '@/services/osu-collector-api';

// const ONE_MINUTE = 60;
export const revalidate = 60 * 60;

export default async function HomePage() {
  const [metadata, popularCollections, recentCollections] = await Promise.all([
    getMetadata(),
    getPopularCollections({
      range: 'month',
      perPage: 12,
    }).then((data) => data.collections),
    getRecentCollections({ perPage: 12 }).then((data) => data.collections),
  ]);

  return <Home metadata={metadata} popularCollections={popularCollections} recentCollections={recentCollections} />;
}
