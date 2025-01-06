import { proxy } from '@/utils/osu-collector-api-proxy';

export async function GET(req: Request) {
  return await proxy('GET', req);
}
