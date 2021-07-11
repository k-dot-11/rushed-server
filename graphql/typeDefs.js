const { gql } = require('apollo-server');

module.exports = gql`
	type Post {
		id: ID!
		title: String!
		body: String!
		createdAt: String!
		username: String!
		comments: [Comment!]!
		upvotes: [Upvote]!
		downvotes: [Downvote]!
		score: Int!
		commentCount: Int!
	}

	type Comment {
		id: ID!
		createdAt: String!
		username: String!
		body: String!
		level: Int!
		parentId: ID
		upvotes: [Upvote]!
		downvotes: [Downvote]!
		score: Int!
	}

	type Upvote {
		username: String!
		createdAt: String!
	}

	type Downvote {
		username: String!
		createdAt: String!
	}

	input RegisterInput {
		username: String!
		password: String!
		confirmPassword: String!
		email: String!
	}

	type User {
		id: ID!
		email: String!
		token: String!
		username: String!
		createdAt: String!
	}

	type Query {
		getPosts: [Post]
		getPost(postId: ID!): Post
	}

	type Mutation {
		register(registerInput: RegisterInput): User!
		login(username: String!, password: String!): User!
		createPost(body: String!, title: String!): Post!
		deletePost(postId: ID!): String!
		createComment(postId: ID!, parentId: ID, level: Int!, body: String!): Post!
		deleteComment(postId: ID!, commentId: ID!): Post!
		upvotePost(postId: ID!): Post!
		downvotePost(postId: ID!): Post!
		downvoteComment(postId: ID!, commentId: ID!): Post!
		upvoteComment(postId: ID!, commentId: ID!): Post!
	}
`;
