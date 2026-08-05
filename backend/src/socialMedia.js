// Facebook-Seite + Instagram-Business-Konto per Meta Graph API bespielen.
// Voraussetzung: FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN, IG_BUSINESS_ACCOUNT_ID in der Env
// (siehe CLAUDE.md für die einmalige Meta-App-Einrichtung).
const GRAPH = 'https://graph.facebook.com/v21.0';

async function graphPost(path, body) {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Graph-API-Fehler (${path})`);
  return data;
}

export async function publishFacebookPhoto({ imageUrl, caption }) {
  const pageId = process.env.FB_PAGE_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !accessToken) throw new Error('FB_PAGE_ID/FB_PAGE_ACCESS_TOKEN fehlen');
  return graphPost(`${pageId}/photos`, { url: imageUrl, caption, access_token: accessToken });
}

export async function publishInstagramPhoto({ imageUrl, caption }) {
  const igId = process.env.IG_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!igId || !accessToken) throw new Error('IG_BUSINESS_ACCOUNT_ID/FB_PAGE_ACCESS_TOKEN fehlen');
  const created = await graphPost(`${igId}/media`, {
    image_url: imageUrl, caption, access_token: accessToken,
  });
  return graphPost(`${igId}/media_publish`, { creation_id: created.id, access_token: accessToken });
}
