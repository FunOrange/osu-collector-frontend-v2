export async function proxy(method: string, req: Request) {
  const upstreamUrl = new URL(req.url);
  upstreamUrl.hostname = withoutProtocol(process.env.NEXT_PUBLIC_OSU_COLLECTOR_API_HOST);
  upstreamUrl.protocol = protocol(process.env.NEXT_PUBLIC_OSU_COLLECTOR_API_HOST);
  upstreamUrl.port = port(process.env.NEXT_PUBLIC_OSU_COLLECTOR_API_HOST);
  try {
    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method,
      headers: removeHeader(req.headers, 'accept-encoding'),
    });
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: (() => {
        const a = removeHeader(upstreamResponse.headers, 'content-encoding');
        return overwriteSetCookieDomain(a, upstreamUrl.hostname);
      })(),
    });
  } catch (error) {
    console.error(upstreamUrl.toString(), error);
    return new Response(error.message, { status: 500 });
  }
}

const protocol = (str: string) => str.match(/^https?:\/\//)?.[0] ?? 'https://';
const port = (str: string) => str.match(/:(\d+)$/)?.[1] ?? '';
const withoutProtocol = (str: string) => str.replace(/^https?:\/\//, '');

function removeHeader(headers: Headers, headerToRemove: string) {
  const newHeaders = new Headers(headers);
  newHeaders.delete(headerToRemove);
  return newHeaders;
}

function overwriteSetCookieDomain(headers: Headers, domain: string) {
  if (headers.get('set-cookie')) {
    const modifiedCookies = headers
      .get('set-cookie')
      .split(',')
      .map((cookie) => cookie.replace(/Domain=[^;]+/i, `Domain=${domain}`))
      .join(',');
    const newHeaders = new Headers(headers);
    newHeaders.set('set-cookie', modifiedCookies);
    return newHeaders;
  }
  return headers;
}
