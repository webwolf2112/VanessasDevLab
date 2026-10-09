const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve the plain HTML/CSS/JS frontend from the same origin as the API,
// so there's no CORS to explain and the Network tab stays focused on status codes.
app.use(express.static(path.join(__dirname, '../frontend')));

// Most scenarios are handled here, keyed by the dropdown value from the frontend.
app.post('/api/demo', (req, res) => {
  const { scenario } = req.body || {};

  switch (scenario) {
    case 'login-success':
      return res.status(200).json({
        message: 'Login successful',
        user: { id: 1, name: 'Vanessa Henson' },
      });

    case 'account-created':
      return res
        .status(201)
        .location('/api/users/42')
        .json({
          message: 'Account created',
          userId: 42,
        });

    case 'missing-field':
      return res.status(400).json({
        error: 'Missing required field: email',
      });

    case 'wrong-password':
      return res
        .status(401)
        // "Bearer" (not "Basic") on purpose: the Basic scheme makes Chrome pop its
        // own native sign-in dialog on any 401 response, even for fetch() calls,
        // which would hijack this demo. Bearer is what real token-based APIs use
        // for a bad-credentials 401 anyway, and browsers don't intercept it.
        .set('WWW-Authenticate', 'Bearer realm="httpcodes-demo", error="invalid_token"')
        .json({
          error: 'Invalid credentials',
        });

    case 'forbidden':
      return res.status(403).json({
        error: 'You do not have permission to access this resource',
      });

    case 'user-not-found':
      return res.status(404).json({
        error: 'User not found',
      });

    case 'rate-limited':
      return res
        .status(429)
        .set('Retry-After', '30')
        .json({
          error: 'Too many requests. Try again later.',
        });

    case 'server-error':
      // eslint-disable-next-line no-console
      console.error('[httpcodes-demo] Simulated server error for scenario "server-error"');
      return res.status(500).json({
        error: 'Internal server error',
      });

    case 'maintenance':
      return res
        .status(503)
        .set('Retry-After', '120')
        .json({
          error: 'Service temporarily unavailable for maintenance',
        });

    default:
      return res.status(400).json({
        error: `Unknown scenario: ${scenario}`,
      });
  }
});

// The "redirected" scenario gets its own GET route on purpose: fetch() follows
// redirects automatically, so the JS response reflects the final destination,
// not the 301 itself. The Network tab is what actually shows the 301 row.
app.get('/api/redirect-demo', (req, res) => {
  res.redirect(301, '/api/redirect-target');
});

app.get('/api/redirect-target', (req, res) => {
  res.status(200).json({
    message: 'You have arrived at the redirected page',
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`httpcodes demo running at http://localhost:${PORT}`);
});
