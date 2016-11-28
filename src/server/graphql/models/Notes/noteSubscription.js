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
      liveQuery({
        query: knex('notes').select(requestedFields).toString(),
        onInsert: ({id, inserted}) => {
          socket.emit(fieldName, {insert: true, inserted});
        },
        onUpdate: ({id, updated}) => {
          socket.emit(fieldName, {update: true, updated});
        },
        onDelete: ({id}) => {
          socket.docQueue.delete(id);
        }
      })
    }
  }
};
