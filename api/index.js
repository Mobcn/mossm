import { Hono } from 'hono';
import { cors } from 'hono/cors';
import dispatcher from '../dispatcher/dispatcher.js';

const app = new Hono();

app.use('*', cors());
app.all('*', (context) => dispatcher(context));

export default app;
