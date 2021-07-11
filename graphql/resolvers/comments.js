const Post = require('../../models/Post');
const checkAuth = require('../../utils/checkAuth');
const { UserInputError, AuthenticationError } = require('apollo-server');

module.exports = {
	Mutation: {
		createComment: async (_, { postId, parentId, body, level }, context) => {
			const { username } = checkAuth(context);
			if (body.trim() === '') {
				throw new UserInputError('Emtpy comment', {
					errors: {
						body: 'Comment must not be empty'
					}
				});
			}
			const post = await Post.findById(postId);
			if (post) {
				if (level == 0) {
					post.comments.unshift({
						body,
						level,
						username,
						createdAt: new Date().toISOString()
					});
				} else {
					post.comments.unshift({
						body,
						level,
						username,
						createdAt: new Date().toISOString(),
						parentId,
					});
				}

				await post.save();
				return post;
			} else throw new UserInputError('The post does not exist anymore');
		},

		// setReply: async (_, { postId, commentId, replyId }, context) => {
		// 	const post = await Post.findById(postId);
		// 	if (post) {
		// 		const parentComment = post.comments.find((comment) => comment.id === commentId);
		// 		if (parentComment.replies) parentComment.replies.unshift({ replyId });
		// 		else {
		// 			parentComment.replies = [];
		// 			parentComment.replies.push({ commentId });
		// 		}

		// 		await post.save();
		// 		return post;
		// 	} else throw new UserInputError('The post does not exist anymore');
		// },

		async upvoteComment(_, { postId, commentId }, context) {
			const { username } = checkAuth(context);

			try {
				const post = await Post.findById(postId);
				const mComment = await post.comments.find((comment) => comment.id === commentId);
				if (mComment) {
					if (mComment.upvotes.find((upvote) => upvote.username === username)) {
						mComment.upvotes = mComment.upvotes.filter((upvote) => upvote.username !== username);
						await post.save();
					} else {
						if (mComment.downvotes.find((downvote) => downvote.username === username))
							mComment.downvotes = mComment.downvotes.filter(
								(downvote) => downvote.username !== username
							);

						mComment.upvotes.push({
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

		async downvoteComment(_, { postId, commentId }, context) {
			const { username } = checkAuth(context);

			try {
				const post = await Post.findById(postId);
				const mComment = await post.comments.find((comment) => comment.id === commentId);
				if (mComment) {
					if (mComment.downvotes.find((downvote) => downvote.username === username)) {
						mComment.downvotes = mComment.downvotes.filter((downvote) => downvote.username !== username);
						await post.save();
					} else {
						if (mComment.upvotes.find((upvote) => upvote.username === username))
							mComment.upvotes = mComment.upvotes.filter((upvote) => upvote.username !== username);

						mComment.downvotes.push({
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

		deleteComment: async (_, { postId, commentId }, context) => {
			const { username } = checkAuth(context);

			try {
				const post = await Post.findById(postId);
				if (post) {
					const commentIndex = post.comments.findIndex((c) => c.id === commentId);

					if (post.comments[commentIndex].username === username) {
						post.comments.splice(commentIndex, 1);
						await post.save();
						return post;
					} else {
						throw new AuthenticationError('Action not allowed');
					}
				} else {
					throw new UserInputError('Post not found');
				}
			} catch (err) {
				throw new Error(err);
			}
		}
	}
};
