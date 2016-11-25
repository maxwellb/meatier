import pgLiveQuery from '../../../database/observer/pgLiveQuery';
import knex from '../../../database/knexDriver';
import {isLoggedIn} from '../authorization';
import {getFields} from '../utils';
import {Lane} from './laneSchema';

export default {
  getAllLanes: {
    type: Lane,
    async resolve(source, args, {authToken, socket}, refs) {
      const {fieldName} = refs;
      const requestedFields = Object.keys(getFields(refs));
      isLoggedIn(authToken);
      console.log(requestedFields)
      pgLiveQuery(
        knex('lanes').select('*')
        .where('isPrivate', '=', false)
        .orWhere('userId', '=', authToken.id)
        .toString(),
        (changes) => {
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
        }
      )
    }
  }
};
