const traceId = `${Date.now()}-test`;

fetch('https://app-api.pixverse.ai/openapi/v2/video/text/generate', {
  method: 'POST',
  headers: {
    'API-KEY': 'sk-41dec6e4113658a2cc6bd81f944f47c4',
    'Ai-trace-id': traceId,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'FIFA World Cup viewing party invitation, cinematic, 4K',
    model: 'v6',
    duration: 5,
    quality: '720p',
    aspect_ratio: '16:9'
  })
})
.then(async r => {
  console.log('Status:', r.status);
  const text = await r.text();
  console.log('Response:', text);
  try {
    const json = JSON.parse(text);
    console.log('Parsed:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('Not JSON');
  }
})
.catch(e => console.error('Error:', e.message));

// Made with Bob
