const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');
const { SECRET_KEY } = require('../../config');

const User = require('../../models/User');

const { validateRegisterInput } = require('../../utils/validators');
const { validateLoginInput } = require('../../utils/validators');

const generateToken = (user) => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username
		},
		SECRET_KEY,
		{ expiresIn: '90 days' }
	);
};

module.exports = {
	Mutation: {
		async login(_, { username, password }) {
			const { errors, valid } = validateLoginInput(username , password);

			if (!valid) throw new UserInputError('Errors', { errors });

			const findUser = await User.findOne({ username });

			if (!findUser) {
				errors.general = 'User not found';
				throw new UserInputError('User not found', { errors });
			}

			const match = await bcrypt.compare(password, findUser.password);
			if (!match) {
				errors.general = 'Wrong creds';
				throw new UserInputError('Wrong creds', { errors });
			}
			const token = generateToken(findUser);

			return {
				...findUser._doc,
				id: findUser._id,
				token
			};
		},

		async register(_, { registerInput: { username, email, password, confirmPassword } }) {
			//TODO: Validate user data
			const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);

			if (!valid) {
				throw new UserInputError('Errors', { errors });
			}

			const findUser = await User.findOne({ username });
			if (findUser) {
				throw new UserInputError('Username is taken', {
					errors: {
						username: 'This username is taken !'
					}
				});
			}

			password = await bcrypt.hash(password, 12);

			const newUser = new User({
				email,
				username,
				password,
				createdAt: new Date().toISOString()
			});

			const res = await newUser.save();

			const token = generateToken(res);

			return {
				...res._doc,
				id: res._id,
				token
			};
		}
	}
};
