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
      lane.createdAt = new Date().getTime()
      const newLane = knex('lanes')
        .returning(lane.keys())
        .insert(lane)
        .then(function(res) {
          console.log({inserted: true})
        }).catch(function(err) {
          console.log(err)
          throw errorObj({_error: 'Could not add lane'})
        })
      return newLane;
    }
  },
  updateLane: {
    type: Lane,
    args: {
      lane: {type: new GraphQLNonNull(UpdatedLane)}
    },
    async resolve(source, {lane}, {authToken}) {
      isLoggedIn(authToken);
      lane.updatedAt = new Date().getTime()
      const updatedLane = knex('lanes')
        .returning(lane.keys())
        .where('id', '=', lane.id)
        .update(updates)
        .then(function(res) {
          console.log({inserted: true})
        }).catch(function(err) {
          console.log(err)
          throw errorObj({_error: 'Could not update lane'});
        })
      return updatedLane;
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
      const result = await knex('users').where({id}).del()
      // return true is delete succeeded, false if doc wasn't found
      return result > 0;
    }
  }
};
