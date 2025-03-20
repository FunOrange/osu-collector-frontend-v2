import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const x = req.nextUrl.searchParams.get('state');
  if (x) {
    // create otp
    const url = process.env.NEXT_PUBLIC_OSU_COLLECTOR_API_HOST + `/api/authentication/create-otp?code=${code}&x=${x}`;
    const { otp } = await fetch(url, { method: 'POST' }).then((res) => res.json());
    redirect(`/login/showOtp?otp=${otp}`);
  } else {
    // set cookie and redirect to home
    const url = process.env.NEXT_PUBLIC_OSU_COLLECTOR_API_HOST + `/api/authentication/osu-oauth-callback?code=${code}`;
    const upstreamResponse = await fetch(url, { method: 'POST' });
    const jwt = upstreamResponse.headers.get('set-cookie').match(/jwt=(.+?);/)[1];
    cookies().set('jwt', jwt, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: ONE_YEAR,
    });
    redirect('/');
  }
}
