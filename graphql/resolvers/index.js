const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
	Post: {
		score: (parent) => {
			console.log(parent);
			return parent.upvotes.length - parent.downvotes.length;
		},

		commentCount: (parent) => {
			return parent.comments.length;
		}
	},

	Comment: {
		score: (parent) => {
			console.log(parent);
			return parent.upvotes.length - parent.downvotes.length;
		}
	},

	Query: {
		...postsResolvers.Query
	},
	Mutation: {
		...usersResolvers.Mutation,
		...postsResolvers.Mutation,
		...commentsResolvers.Mutation
	}
};
