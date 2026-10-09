# HTTP Status Codes Demo

Demo app for a training video on HTTP status codes and how to view/troubleshoot them in Chrome DevTools.

A single Express server serves both the API and the plain HTML/CSS/JS frontend from the same origin (`http://localhost:3000`), so there's no CORS setup to explain — the Network tab stays focused on status codes.

## Running it

```bash
cd backend
npm install
npm start
```

Then open `http://localhost:3000` in Chrome.

## Using the demo

Pick a scenario from the dropdown and submit. The page shows the status code, status text, and response body inline. Then open Chrome DevTools (`Cmd+Option+I`) and click the **Network** tab to inspect the actual request:

- Click the request row to see **Headers**, **Response**, and **Timing** sub-tabs.
- The **Status** column shows the code at a glance; red rows mean 4xx/5xx.
- For the redirect scenario, turn on **Preserve log** before submitting — `fetch()` follows redirects automatically, so without it the original 301 row disappears once the browser follows through to the final response.
- For the 500 scenario, check the **Console** tab too — the server logs an error there.

## Scenarios covered

| Dropdown option | Status | What to look at in DevTools |
|---|---|---|
| Successful login | 200 OK | Baseline request/response, Headers, Timing |
| New account created | 201 Created | `Location` header pointing at the new resource |
| Redirected to new page | 301 Moved Permanently | Redirect chain with Preserve log on |
| Missing required field | 400 Bad Request | Response body has the validation error |
| Wrong password | 401 Unauthorized | `WWW-Authenticate` header |
| Access a forbidden resource | 403 Forbidden | 401 vs 403 |
| Lookup a user that doesn't exist | 404 Not Found | Response body vs. just the status |
| Too many requests | 429 Too Many Requests | `Retry-After` header |
| Trigger a server bug | 500 Internal Server Error | Console error + red Network row |
| Site under maintenance | 503 Service Unavailable | `Retry-After`, vs. 429 |

## Structure

```
httpcodes/
├── README.md
├── backend/
│   ├── server.js       # Express app: API routes + serves frontend/ statically
│   └── package.json
└── frontend/
    ├── index.html       # scenario dropdown + result panel
    ├── script.js        # fetch() calls, renders result, no page reload
    └── style.css         # unstyled for now
```
