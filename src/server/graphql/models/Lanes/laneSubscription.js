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
      const {docQueue} = socket
      liveQuery({
        query: knex('lanes').column(requestedFields).select()
        .where('isPrivate', '=', false)
        .orWhere('userId', '=', authToken.id)
        .toString(),
        onChange: ({type, data, id}) => {
          if (data.id && docQueue.has(data.id)) {
            docQueue.delete(data.id)
          } else {
            socket.emit(fieldName, {type, data, id});
          }
        }
      })
    }
  }
};
