export async function proxy(method: string, req: Request) {
  const url = new URL(req.url);
  const upstreamUrl = process.env.NEXT_PUBLIC_OSU_COLLECTOR_API_HOST + url.pathname;
  const upstreamResponse = await fetch(upstreamUrl, {
    method,
    headers: removeHeader(req.headers, 'accept-encoding'),
  });
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: (() => {
      const a = removeHeader(upstreamResponse.headers, 'content-encoding');
      return overwriteSetCookieDomain(a, url.hostname);
    })(),
  });
}

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
