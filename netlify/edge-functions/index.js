import { Hono } from 'jsr:@hono/hono';
import { handle } from 'jsr:@hono/hono/netlify';
import dispatcher from '../../dispatcher/dispatcher.js';

const app = new Hono();

app.all('*', (context) => dispatcher(context));

export default handle(app);
