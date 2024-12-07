import { z } from 'zod';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import drizzle from '../../drizzle';
import { sign, verify } from 'hono/jwt';
import { compare, hash } from 'bcryptjs';
import { zValidator } from '@hono/zod-validator';
import { posts, users } from '../../drizzle/schema';

const app = new Hono<{ Bindings: Env }>();

app.post(
	'/account',
	zValidator(
		'json',
		z.object({
			username: z
				.string()
				.max(20)
				.regex(/^[a-zA-Z0-9]+$/)
				.toLowerCase(),
			password: z.string(),
		})
	),
	async (c) => {
		try {
			const db = drizzle(c.env.DB);

			const { username, password } = c.req.valid('json');
			await db.insert(users).values({ username, password: await hash(password, 10) });
			return c.text('account created successfully', 200);
		} catch (error) {
			return c.text('username taken', 400);
		}
	}
);

app.post(
	'/token',
	zValidator(
		'json',
		z.object({
			username: z
				.string()
				.max(20)
				.regex(/^[a-zA-Z0-9]+$/)
				.toLowerCase(),
			password: z.string(),
		})
	),
	async (c) => {
		try {
			const db = drizzle(c.env.DB);

			const { username, password } = c.req.valid('json');
			const user = await db.query.users.findFirst({ where: eq(users.username, username), columns: { password: true } });
			if (!user || !(await compare(password, user.password))) return c.text('authorization failed', 400);
			const token = await sign({ username }, c.env.PRIVATE_KEY);
			return c.text(token, 200);
		} catch (error) {
			return c.text('authorization failed', 400);
		}
	}
);

app.post(
	'/post',
	zValidator(
		'json',
		z.object({
			content: z.string().min(1).max(10000),
		})
	),
	zValidator(
		'header',
		z.object({
			authorization: z.string(),
		})
	),
	async (c) => {
		try {
			const db = drizzle(c.env.DB);

			const { authorization: key } = c.req.valid('header');
			const { content } = c.req.valid('json');
			const { username } = await verify(key, c.env.PRIVATE_KEY);
			await db.insert(posts).values({ content, author: username as string });
			return c.text('posted successfully', 200);
		} catch (error) {
			return c.text("couldn't post, authorization failed", 400);
		}
	}
);

export default app;
