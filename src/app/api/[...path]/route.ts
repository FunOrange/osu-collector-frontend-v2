import { proxy } from '@/utils/osu-collector-api-proxy';

export async function GET(req: Request) {
  return await proxy('GET', req);
}

export async function POST(req: Request) {
  return await proxy('POST', req);
}

export async function PATCH(req: Request) {
  return await proxy('PATCH', req);
}

export async function PUT(req: Request) {
  return await proxy('PUT', req);
}

export async function DELETE(req: Request) {
  return await proxy('DELETE', req);
}
