import knex from '../../../database/knexDriver';
import {isLoggedIn} from '../authorization';
import {getFields} from '../utils';
import {Lane} from './laneSchema';
import {liveQuery, unwatch} from '../../../database/observer/pgLiveQuery';

export default {
  getAllLanes: {
    type: Lane,
    async resolve(source, args, {authToken, socket}, refs) {
      const {fieldName} = refs;
      const requestedFields = Object.keys(getFields(refs));
      isLoggedIn(authToken);
      socket.on('unsubscribe', channelName => {
        if (channelName === fieldName) {
          unwatch();
        }
      });
      liveQuery({
        query: knex('lanes').column(requestedFields).select()
        .where('isPrivate', '=', false)
        .orWhere('userId', '=', authToken.id)
        .toString(),
        onInsert: ({id, inserted}) => {
          if (!socket.docQueue.has(id)) {
            console.log("insert", authToken)
            socket.emit(fieldName, {insert: true, inserted});
          }
        },
        onUpdate: ({id, updated}) => {
          socket.emit(fieldName, {update: true, updated});
        },
        onDelete: ({id}) => {
          if (socket.docQueue.has(id)) {
            socket.docQueue.delete(id)
          }
        },
        userId: authToken.id
      })
    }
  }
};
