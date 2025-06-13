const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function CommentSeeder() {
	console.log("Comment seeding started...");
	
	const users = await prisma.user.findMany({ select: { id: true } });
	const posts = await prisma.post.findMany({ select: { id: true } });
	
	const data = [];

	for (let i = 0; i < 40; i++) {
		const content = faker.lorem.paragraph();
		const userId = faker.helpers.arrayElement(users).id;
		const postId = faker.helpers.arrayElement(posts).id;

		data.push({ content, userId, postId });
	}

	await prisma.comment.createMany({ data });
	console.log("Comment seeding done.");
}

module.exports = { CommentSeeder };
