import { Hono } from 'hono';
import username from './routes/username';
import create from './routes/api/create';

const app = new Hono<{ Bindings: Env }>();

// constant routes
app.get('/', (c) => c.text(`welcome to temporal - a minimal text based app to share your thoughts`));
app.notFound((c) => c.text(`404 - you finally escaped the matrix`, 404));

// app routes
app.route('/', username);

// api routes
app.route('/api/create/', create);

export default app;
