// Proxies /api/* to the IDICorp service so the browser sees one origin.
// The service sets its session cookies for its own domain; this strips the Domain
// attribute so the browser stores them for the site that serves the app.
const UPSTREAM = 'https://ts.idicorp.ir'

export default async (request) => {
  const url = new URL(request.url)
  const target = new URL(url.pathname + url.search, UPSTREAM)

  const headers = new Headers(request.headers)
  headers.delete('host')

  // Do not forward the hosting platform's own cookies to the API.
  const cookie = headers.get('cookie')
  if (cookie) {
    const kept = cookie
      .split(';')
      .map((c) => c.trim())
      .filter((c) => c && !c.startsWith('nf_'))
      .join('; ')
    if (kept) headers.set('cookie', kept)
    else headers.delete('cookie')
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method)
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: 'manual',
  })

  const responseHeaders = new Headers(upstream.headers)
  responseHeaders.delete('set-cookie')
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')
  for (const c of upstream.headers.getSetCookie()) {
    responseHeaders.append('set-cookie', c.replace(/;\s*domain=[^;]*/i, ''))
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export const config = { path: '/api/*' }
