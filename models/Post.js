const { model, schema, Schema } = require('mongoose');
const postSchema = new Schema({
	title: String,
	body: String,
	username: String,
	createdAt: String,
	comments: [
		{
			body: String,
			username: String,
			createdAt: String,
			level: Number,
			parentId: String,
			
			upvotes: [
				{
					username: String,
					createdAt: String
				}
			],
			downvotes: [
				{
					username: String,
					createdAt: String
				}
			]
		}
	],
	upvotes: [
		{
			username: String,
			createdAt: String
		}
	],
	downvotes: [
		{
			username: String,
			createdAt: String
		}
	],

	user: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	}
});

module.exports = model('Post', postSchema);
