import knex from '../../../database/knexDriver';
import {GraphQLNonNull, GraphQLID} from 'graphql';
import {User, UserWithAuthToken} from './userSchema';
import {errorObj} from '../utils';
import {GraphQLEmailType, GraphQLPasswordType} from '../types';
import {getUserByEmail, signJwt, getAltLoginMessage} from './helpers';
import promisify from 'es6-promisify';
import bcrypt from 'bcrypt';
import {isAdminOrSelf} from '../authorization';

const compare = promisify(bcrypt.compare);

export default {
  getUserById: {
    type: User,
    args: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, args, {authToken}) {
      isAdminOrSelf(authToken, args);
      const user = await knex('users').select('*').where({id:args.id});
      console.log(user)
      if (!user || user.length !== 1) {
        throw errorObj({_error: 'User not found'});
      }
      return user[0];
    }
  },
  login: {
    type: UserWithAuthToken,
    args: {
      email: {type: new GraphQLNonNull(GraphQLEmailType)},
      password: {type: new GraphQLNonNull(GraphQLPasswordType)}
    },
    async resolve(source, args) {
      const {email, password} = args;
      const user = await getUserByEmail(email);
      if (!user || !user.id) {
        throw errorObj({_error: 'User not found'});
      }
      const hashedPassword = user.password
      if (!hashedPassword) {
        throw errorObj({_error: "no password"});
      }
      const isCorrectPass = await compare(password, hashedPassword);
      if (isCorrectPass) {
        const authToken = signJwt({id: user.id});
        return {authToken, user};
      }
      throw errorObj({_error: 'Login failed', password: 'Incorrect password'});
    }
  },
  loginAuthToken: {
    type: User,
    async resolve(source, args, {authToken}) {
      const {id} = authToken;
      if (!id) {
        throw errorObj({_error: 'Invalid authentication Token'});
      }
      const user = await knex('users').select('*').where({id});

      if (!user || user.length !== 1) {
        throw errorObj({_error: 'User not found'});
      }
      return user[0];
    }
  }
};
