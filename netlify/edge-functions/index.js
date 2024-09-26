import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { handle } from 'https://deno.land/x/hono/adapter/netlify/mod.ts'
import dispatcher from '../../dispatcher/dispatcher.js';

const app = new Hono();

app.all('*', (context) => dispatcher(context));

export default handle(app);
