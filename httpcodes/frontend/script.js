// Each scenario defines:
//  - fields: the form inputs shown when this scenario is picked, and what gets
//    sent as the request payload (so the Payload/Request tab in DevTools shows
//    realistic data).
//  - method/url: only set for the one scenario that isn't a POST to /api/demo.
//  - tip: what to look at in DevTools once the response comes back.
//
// The status code returned is always driven by the scenario itself (handled
// server-side), not by validating these field values — that keeps the demo
// 100% reliable to trigger live, while the request still looks realistic.
const SCENARIOS = {
  'login-success': {
    fields: [
      { name: 'email', label: 'Email', type: 'email', value: 'vanessa@example.com' },
      { name: 'password', label: 'Password', type: 'password', value: 'password123' },
    ],
    message: 'Vanessa Henson successfully logged in.',
    tip: 'Everything went through correctly and the data should be succefully returned. If you are still not seeing the correct datat there is something going on with the actual data being sent back usually.',
  },
  'account-created': {
    fields: [
      { name: 'name', label: 'Full name', type: 'text', value: 'Grace Hopper' },
      { name: 'email', label: 'Email', type: 'email', value: 'grace@example.com' },
      { name: 'password', label: 'Password', type: 'password', value: 'newpassword456' },
    ],
    message: 'Account created for Grace Hopper.',
    tip: 'Check the response Headers for the Location header pointing at the new resource.',
  },
  redirected: {
    fields: [
      { name: 'page', label: 'Page you’re requesting', type: 'text', value: '/old-promo-page' },
    ],
    method: 'GET',
    url: '/api/redirect-demo',
    message: 'You were redirected to the new page.',
    tip: 'fetch() follows redirects automatically, so this result shows the final page. Turn on "Preserve log" in the Network tab and re-submit to see the original 301 row.',
  },
  'missing-field': {
    fields: [
      { name: 'email', label: 'Email', type: 'email', value: '', placeholder: '(left blank on purpose)' },
    ],
    message: 'Login failed: email is required.',
    tip: 'The status alone doesn’t say what’s wrong — read the response body for the actual validation error.',
  },
  'wrong-password': {
    fields: [
      { name: 'email', label: 'Email', type: 'email', value: 'vanessa@example.com' },
      { name: 'password', label: 'Password', type: 'password', value: 'wrongpassword' },
    ],
    message: 'Login failed: incorrect password.',
    tip: '',
  },
  forbidden: {
    fields: [
      { name: 'resourceId', label: 'Resource ID', type: 'text', value: 'admin-settings' },
    ],
    message: 'Access denied to this resource.',
    tip: 'Compare this to the 401 case — 403 means "I know who you are, but you do not have the correct permissions to access this resource."',
  },
  'user-not-found': {
    fields: [
      { name: 'username', label: 'Username', type: 'text', value: 'unknown-user' },
    ],
    message: 'No user found with that username.',
    tip: 'A 404 can still have a useful body — check the Response tab, not just the status column.',
  },
  'rate-limited': {
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text', value: 'client-123' },
    ],
    message: 'Too many requests — please slow down.',
    tip: '',
  },
  'server-error': {
    fields: [
      { name: 'action', label: 'Action', type: 'text', value: 'process-payment' },
    ],
    message: 'Something went wrong on the server.',
    tip: 'Most of the time you will need to talk to the backend developers or contact customer service because it means something is wrong with the backend service and this generally involves manual troubleshooting from the developement team.',
  },
  maintenance: {
    fields: [
      { name: 'service', label: 'Service', type: 'text', value: 'checkout-service' },
    ],
    message: 'This service is temporarily unavailable.',
    tip: 'Usually try again, or some sort of maintaince window will hopefully show up on the screen.',
  },
};

// Plain-English meaning of each HTTP status code itself, shown in the response
// panel alongside the scenario's message so it can be explained on camera.
const STATUS_INFO = {
  200: 'OK — the request succeeded and the server returned the requested data.',
  201: 'Created — the request succeeded and a new resource was created as a result.',
  301: 'Moved Permanently — this resource now lives at a different URL; clients should update their links.',
  400: 'Bad Request — the server couldn’t understand the request because of invalid syntax or missing data.',
  401: 'Unauthorized — the request lacks valid authentication credentials, so the server doesn’t know who’s asking.',
  403: 'Forbidden — the server knows who you are, but you don’t have permission to access this resource.',
  404: 'Not Found — the server can’t find the requested resource.',
  429: 'Too Many Requests — you’ve sent too many requests in a given time and are being rate-limited.',
  500: 'Internal Server Error — something went wrong on the server, and it doesn’t know how to handle it.',
  503: 'Service Unavailable — the server isn’t ready to handle the request right now, often due to maintenance or overload.',
};

const form = document.getElementById('demo-form');
const scenarioSelect = document.getElementById('scenario');
const fieldsContainer = document.getElementById('scenario-fields');
const resultSection = document.getElementById('result');
const resultStatus = document.getElementById('result-status');
const resultTip = document.getElementById('result-tip');
const resultMessage = document.getElementById('result-message');
const resultDefinition = document.getElementById('result-definition');
const resultDefinitionText = document.getElementById('result-definition-text');

scenarioSelect.addEventListener('change', () => {
  renderFields(SCENARIOS[scenarioSelect.value]);
});

function renderFields(config) {
  fieldsContainer.innerHTML = '';

  if (!config || !config.fields || config.fields.length === 0) {
    fieldsContainer.hidden = true;
    return;
  }

  config.fields.forEach((field) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'field';

    const label = document.createElement('label');
    label.setAttribute('for', `field-${field.name}`);
    label.textContent = field.label;

    const input = document.createElement('input');
    input.type = field.type || 'text';
    input.id = `field-${field.name}`;
    input.name = field.name;
    input.value = field.value ?? '';
    if (field.placeholder) input.placeholder = field.placeholder;

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    fieldsContainer.appendChild(wrapper);
  });

  fieldsContainer.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the native form submit / page reload

  const scenario = scenarioSelect.value;
  const config = SCENARIOS[scenario];
  if (!config) return;

  const values = {};
  (config.fields || []).forEach((field) => {
    values[field.name] = document.getElementById(`field-${field.name}`).value;
  });

  try {
    let response;
    if (config.method === 'GET') {
      const query = new URLSearchParams(values).toString();
      response = await fetch(`${config.url}?${query}`);
    } else {
      response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, ...values }),
      });
    }

    await response.json(); // consumed so DevTools shows the full request/response cycle
    renderResult(response.status, response.statusText, config.message, config.tip);
  } catch (err) {
    renderResult('—', 'Network error', 'Something went wrong making the request.', 'Check the Console tab for details.');
  }
});

function renderResult(status, statusText, message, tip) {
  resultSection.hidden = false;
  resultSection.open = false; // stay collapsed until clicked, even on repeat submits
  resultMessage.textContent = message;
  resultTip.textContent = tip;

  resultStatus.textContent = `${status} ${statusText}`;
  resultStatus.className = 'status-badge';

  const info = STATUS_INFO[status];
  resultDefinition.hidden = !info;
  resultDefinitionText.textContent = info || '';

  if (typeof status === 'number') {
    resultStatus.classList.add(`status-${String(status)[0]}xx`);
  }
}
