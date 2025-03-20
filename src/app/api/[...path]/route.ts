import { proxy } from '@/utils/osu-collector-api-proxy';

export async function GET(req: Request) {
  return await proxy(req);
}

export async function POST(req: Request) {
  return await proxy(req);
}

export async function PATCH(req: Request) {
  return await proxy(req);
}

export async function PUT(req: Request) {
  return await proxy(req);
}

export async function DELETE(req: Request) {
  return await proxy(req);
}
