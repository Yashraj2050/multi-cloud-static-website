/**
 * Multi-Cloud Failover Router — Cloudflare Worker
 *
 * Routes incoming requests to the primary origin (AWS S3) and
 * falls back to the secondary origin (Azure Blob Static Website)
 * when the primary is unreachable or returns a 5xx server error.
 *
 * Routing Logic:
 *   1. Forward the request path to AWS_ORIGIN.
 *   2. If AWS responds with 2xx/3xx/4xx → return that response directly.
 *      (A real 404 from the origin remains a 404 for the client.)
 *   3. If AWS fails with a network error or 5xx → try AZURE_ORIGIN.
 *   4. If Azure also fails → return a 503 Service Unavailable.
 *
 * This Worker does NOT:
 *   - Modify response bodies.
 *   - Rewrite asset paths.
 *   - Perform active health checks (it uses passive, request-time detection).
 */

export default {
  /**
   * @param {Request} request
   * @param {Object} env
   * @returns {Promise<Response>}
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname + url.search;

    // --- Origin URLs from environment variables ---
    const awsOrigin = env.AWS_ORIGIN;
    const azureOrigin = env.AZURE_ORIGIN;

    // --- Custom response headers for observability ---
    const routerHeaders = {
      'X-Router': 'multicloud-failover',
      'X-Router-Timestamp': new Date().toISOString(),
    };

    // --- Attempt primary origin: AWS S3 ---
    try {
      const awsUrl = awsOrigin + path;
      const awsResponse = await fetch(awsUrl, {
        method: request.method,
        headers: filterRequestHeaders(request.headers),
        redirect: 'follow',
      });

      // If AWS returns a client-usable response (any non-5xx), serve it.
      // This preserves real 404s, 403s, etc. from the origin.
      if (awsResponse.status < 500) {
        return buildResponse(awsResponse, {
          ...routerHeaders,
          'X-Served-By': 'aws-s3',
          'X-Origin': awsOrigin,
        });
      }

      // AWS returned 5xx — fall through to Azure
      console.log(`AWS returned ${awsResponse.status}, failing over to Azure`);
    } catch (err) {
      // Network error reaching AWS — fall through to Azure
      console.log(`AWS fetch failed: ${err.message}, failing over to Azure`);
    }

    // --- Attempt secondary origin: Azure Blob Storage ---
    try {
      const azureUrl = azureOrigin + path;
      const azureResponse = await fetch(azureUrl, {
        method: request.method,
        headers: filterRequestHeaders(request.headers),
        redirect: 'follow',
      });

      return buildResponse(azureResponse, {
        ...routerHeaders,
        'X-Served-By': 'azure-blob',
        'X-Origin': azureOrigin,
        'X-Failover': 'true',
      });
    } catch (err) {
      console.log(`Azure fetch also failed: ${err.message}`);
    }

    // --- Both origins failed ---
    return new Response(
      '<!DOCTYPE html><html><head><title>503 Service Unavailable</title></head>' +
      '<body><h1>503 Service Unavailable</h1>' +
      '<p>All origin servers are currently unreachable. Please try again later.</p>' +
      '<p><small>Multi-Cloud Failover Router</small></p></body></html>',
      {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...routerHeaders,
          'X-Served-By': 'none',
          'X-Failover': 'exhausted',
        },
      }
    );
  },
};

/**
 * Build a response from the origin response, appending custom headers.
 * Clones the response to allow header modification.
 *
 * @param {Response} originResponse
 * @param {Object} extraHeaders
 * @returns {Response}
 */
function buildResponse(originResponse, extraHeaders) {
  const headers = new Headers(originResponse.headers);

  // Add router observability headers
  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.set(key, value);
  }

  // Remove potentially restrictive origin headers that may
  // interfere with cross-origin serving through the Worker
  headers.delete('x-amz-request-id');
  headers.delete('x-amz-id-2');

  return new Response(originResponse.body, {
    status: originResponse.status,
    statusText: originResponse.statusText,
    headers,
  });
}

/**
 * Filter request headers to pass only safe, relevant headers to origins.
 * Strips Cloudflare-internal and hop-by-hop headers.
 *
 * @param {Headers} incomingHeaders
 * @returns {Headers}
 */
function filterRequestHeaders(incomingHeaders) {
  const filtered = new Headers();
  const skipPrefixes = ['cf-', 'x-forwarded-', 'x-real-'];
  const skipExact = new Set([
    'host', 'connection', 'keep-alive', 'transfer-encoding',
    'te', 'trailer', 'upgrade', 'proxy-authorization',
    'proxy-connection',
  ]);

  for (const [key, value] of incomingHeaders.entries()) {
    const lower = key.toLowerCase();
    if (skipExact.has(lower)) continue;
    if (skipPrefixes.some((p) => lower.startsWith(p))) continue;
    filtered.set(key, value);
  }

  return filtered;
}
