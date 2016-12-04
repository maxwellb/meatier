import {isLoggedIn} from '../authorization';
import {getFields} from '../utils';
import {Note} from './noteSchema';
import {liveQuery, unwatch} from '../../../database/observer/pgLiveQuery';
import knex from '../../../database/knexDriver';

export default {
  getAllNotes: {
    type: Note,
    async resolve(source, args, {authToken, socket}, refs) {
      const {fieldName} = refs;
      const requestedFields = Object.keys(getFields(refs))
      isLoggedIn(authToken)
      socket.on('unsubscribe', channelName => {
        if (channelName === fieldName) {
          unwatch();
        }
      })
      const {docQueue} = socket
      liveQuery({
        query: knex('notes').select(requestedFields).toString(),
        onChange: ({type, data, id}) => {
          if (data.id && docQueue.has(data.id)) {
            docQueue.delete(id)
          } else {
            socket.emit(fieldName, {type, data, id});
          }
        }
      })
    }
  }
};
