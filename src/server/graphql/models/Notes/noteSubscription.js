import {isLoggedIn} from '../authorization';
import {getFields} from '../utils';
import {Note} from './noteSchema';
import pgLiveQuery from '../../../database/observer/pgLiveQuery';
import knex from '../../../database/knexDriver';

export default {
  getAllNotes: {
    type: Note,
    async resolve(source, args, {authToken, socket}, refs) {
      const {fieldName} = refs;
      const requestedFields = Object.keys(getFields(refs));
      isLoggedIn(authToken);
      console.log("source",source)
      console.log("args",args)
      console.log("requestedFields",requestedFields)
      pgLiveQuery(
        knex('notes').select('*').toString(),
        ({changes, unsubscribeCallback}) => {
          changes.forEach(({ id, rn, data }) => {
            if(data) {
              console.log(`upsert: ${id} at row ${rn}`, data);
              socket.emit(fieldName, data);
            }
            else {
              console.log(`delete: ${id}`);
              socket.docQueue.delete(id);
            }
          })
          socket.on('unsubscribe', channelName => {
            if (channelName === fieldName) {
              unsubscribeCallback();
            }
          });
        }
      )
    }
  }
};
