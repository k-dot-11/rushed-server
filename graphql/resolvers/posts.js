const { AuthenticationError, UserInputError } = require('apollo-server-errors');
const Post = require('../../models/Post');
const checkAuth = require('../../utils/checkAuth');

module.exports = {
	Query: {
		async getPosts() {
			try {
				const posts = await Post.find().sort({ createdAt: -1 });
				return posts;
			} catch (err) {
				throw new Error(err);
			}
		},
		async getPost(_, { postId }) {
			try {
				if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
					throw new Error('Post id not valid');
				}
				const post = await Post.findById(postId);
				if (post) return post;
				else {
					throw new Error('Post not found');
				}
			} catch (err) {
				throw new Error(err);
			}
		}
	},

	Mutation: {
		async createPost(_, { body, title }, context) {
			const user = checkAuth(context);

			if (body.trim() === '') throw new UserInputError('Post body must not be empty');

			const newPost = new Post({
				body,
				title,
				user: user.indexOf,
				username: user.username,
				createdAt: new Date().toISOString()
			});

			const post = await newPost.save();

			return post;
		},

		async deletePost(_, { postId }, context) {
			const user = checkAuth(context);

			try {
				const post = await Post.findById(postId);
				if (user.username === post.username) {
					await post.delete();
					return 'Post deleted successfully';
				} else {
					throw new AuthenticationError('Action not allowed');
				}
			} catch (err) {
				throw new Error(err);
			}
		},

		async upvotePost(_, { postId }, context) {
			const { username } = checkAuth(context);

			try {
				const post = await Post.findById(postId);

				if (post) {
					if (post.upvotes.find((upvote) => upvote.username === username)) {
						post.upvotes = post.upvotes.filter((upvote) => upvote.username !== username);
						await post.save();
					} else {
						if (post.downvotes.find((downvote) => downvote.username === username))
							post.downvotes = post.downvotes.filter((downvote) => downvote.username !== username);

						post.upvotes.push({
							username,
							createdAt: new Date().toISOString()
						});
						await post.save();
					}
					return post;
				} else {
					throw new UserInputError('Post does not exist anymore');
				}
			} catch (err) {
				throw new Error(err);
			}
		},

		async downvotePost(_, { postId }, context) {
			const { username } = checkAuth(context);

			try {
				const post = await Post.findById(postId);

				if (post) {
					if (post.downvotes.find((downvote) => downvote.username === username)) {
						post.downvotes = post.downvotes.filter((downvote) => downvote.username !== username);
						await post.save();
					} else {
						if (post.upvotes.find((upvote) => upvote.username === username))
							post.upvotes = post.upvotes.filter((upvote) => upvote.username !== username);
						post.downvotes.push({
							username,
							createdAt: new Date().toISOString()
						});
						await post.save();
					}
					return post;
				} else {
					throw new UserInputError('Post does not exist anymore');
				}
			} catch (err) {
				throw new Error(err);
			}
		}
	}
};
