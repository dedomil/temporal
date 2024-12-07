import RelativeTimeFormat from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
RelativeTimeFormat.addLocale(en);

type User = {
	username: string;
	posts: {
		content: string;
		timestamp: Date;
		id: string;
		author: string;
	}[];
};

export function createUserProfile(user: User) {
	let text = '[temporal]\n\n';
	for (let post = 0; post < user.posts.length; post++) {
		const index = user.posts.length - post - 1;
		const { content, timestamp } = user.posts[index];
		const time = new RelativeTimeFormat('en').format(timestamp.getTime());
		text += `&${user.username}#${index} - ${time}\n${content}\n${post == user.posts.length - 1 ? '' : '---\n'}`;
	}
	return text;
}
