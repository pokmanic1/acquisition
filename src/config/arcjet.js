import arcjet, { shield, detectBot } from '@arcjet/node';

// Base rules applied to every request. The per-role rate limit is added
// in security.middleware.js via aj.withRule(slidingWindow(...)).
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      allow: [
        'CATEGORY:SEARCH_ENGINE',
        'CATEGORY:PREVIEW',
        // Allow API testing tools (Postman, curl) only outside production
        ...(process.env.NODE_ENV !== 'production' ? ['POSTMAN', 'CURL'] : []),
      ],
    }),
  ],
});

export default aj;
