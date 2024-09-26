import 'dotenv/config';
import { serve } from '@hono/node-server';
import App from './api/index.js';

serve({
    fetch: App.fetch,
    port: 3300
});
