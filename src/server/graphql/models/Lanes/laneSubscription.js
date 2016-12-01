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
          console.log(socket.docQueue)
          if (socket.docQueue.has(inserted.id)) {
            socket.docQueue.delete(id)
          } else {
            socket.emit(fieldName, {insert: true, inserted});
          }
        },
        onUpdate: ({id, updated}) => {
          if (socket.docQueue.has(updated.id)) {
            socket.docQueue.delete(id)
          } else {
            socket.emit(fieldName, {update: true, updated});
          }
        },
        onDelete: ({id}) => {
          if (socket.docQueue.has(id)) {
            socket.docQueue.delete(id)
          } else {
            socket.emit(fieldName, {id});
          }
        }
      })
    }
  }
};
