import { z } from 'zod';
import { Hono } from 'hono';
import drizzle from '../drizzle';
import { posts, users } from '../drizzle/schema';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { createUserProfile } from '../helpers';

const app = new Hono<{ Bindings: Env }>();

app.get(
	'/:username',
	zValidator(
		'param',
		z.object({
			username: z.string().max(20),
		})
	),
	async (c) => {
		const { username } = c.req.valid('param');
		const db = drizzle(c.env.DB);

		const queryResponse = await db.query.users.findFirst({
			where: eq(users.username, username),
			columns: { username: true },
			with: { posts: true },
		});

		if (!queryResponse) return c.notFound();
		if (!queryResponse.posts.length) return c.text(`no thoughts found\n`);
		return c.text(createUserProfile(queryResponse));
	}
);

app.get(
	'/:username/:offset',
	zValidator(
		'param',
		z.object({
			username: z.string().max(20),
			offset: z.string().transform((p) => parseInt(p) || 0),
		})
	),
	async (c) => {
		const { username, offset } = c.req.valid('param');
		const db = drizzle(c.env.DB);

		const queryResponse = await db.query.posts.findFirst({
			where: eq(posts.author, username),
			offset,
		});

		if (!queryResponse) return c.notFound();
		return c.text(createUserProfile({ username, posts: [queryResponse] }));
	}
);

export default app;
