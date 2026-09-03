# Stedieh MLBB ID Checker v2

This version is designed to make errors visible instead of only showing "no response".

## Files
- `index.html` — checker UI
- `netlify/functions/checkid.js` — server-side EliteDias request
- `netlify.toml` — Netlify configuration
- `package.json`

## API request used

POST `https://api.elitedias.com/checkid`

```json
{
  "game": "mlbb",
  "userid": "83414542",
  "serverid": "2163"
}
```

## IMPORTANT: deploy method

For Netlify Functions, do NOT rely on dragging only `index.html` into Netlify Drop.

Recommended:
1. Put this entire folder in a GitHub repository.
2. In Netlify choose **Add new project → Import an existing project**.
3. Select the repository.
4. Deploy.

Alternative: deploy the whole project with the Netlify CLI.

## Quick function test

After deployment, open:

`https://YOUR-SITE.netlify.app/.netlify/functions/checkid`

If the function is online you should see JSON similar to:

```json
{
  "ok": true,
  "message": "Stedieh checkid function is online. Send POST with userid and serverid."
}
```

If you get Netlify 404, the function was not deployed.

## Diagnostics

The page has a **Technical details** section.
If checking fails, open it and copy the text. It will show whether:
- the Netlify Function is missing,
- EliteDias could not be reached,
- or EliteDias returned an API error.
