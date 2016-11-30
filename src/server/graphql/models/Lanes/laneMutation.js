import {Lane, NewLane, UpdatedLane} from './laneSchema';
import {errorObj} from '../utils';
import {isLoggedIn} from '../authorization';
import {GraphQLNonNull, GraphQLBoolean, GraphQLID} from 'graphql';
import knex from '../../../database/knexDriver';

export default {
  addLane: {
    type: Lane,
    args: {
      lane: {type: new GraphQLNonNull(NewLane)}
    },
    async resolve(source, {lane}, {authToken}) {
      isLoggedIn(authToken);
      // lane.createdAt = new Date().getTime()
      const newLane = await knex('lanes')
        .returning(Object.keys(lane))
        .insert(lane)

      console.log("insertion", newLane)
      if (newLane.length && newLane.length === 1) {
        return newLane[0];
      } else {
        // console.log({_error: 'No lane was created'})
        throw errorObj({_error: 'No lane was created'});
      }
    }
  },
  updateLane: {
    type: Lane,
    args: {
      lane: {type: new GraphQLNonNull(UpdatedLane)}
    },
    async resolve(source, {lane}, {authToken}) {
      isLoggedIn(authToken);
      // lane.updatedAt = new Date().getTime()
      const updatedLane = await knex('lanes')
        .returning(Object.keys(lane))
        .where('id', '=', lane.id)
        .update(lane)

      if (updatedLane.length && updatedLane.length === 1) {
        return updatedLane[0];
      } else {
        throw errorObj({_error: 'No lane was updated'});
      }
    }
  },
  deleteLane: {
    type: GraphQLBoolean,
    args: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, {id}, {authToken}) {
      isLoggedIn(authToken);
      const {id: verifiedId, isAdmin} = authToken;
      // if (!isAdmin) {
      //   const laneToDelete = await knex.select('id').from('users').where({id})
      //   if (!laneToDelete) {
      //     return false;
      //   }
      //   if (laneToDelete.userId !== verifiedId) {
      //     throw errorObj({_error: 'Unauthorized'});
      //   }
      // }
      const result = await knex('lanes').where({id}).del()
      console.log("delete",result)
      // return true is delete succeeded, false if doc wasn't found
      return result > 0;
    }
  }
};
