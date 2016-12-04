import {liveQuery} from './pgLiveQuery';
import knex from 'knex'

export default function liveTest() {
  liveQuery({
    query: `
    SELECT
        *
    FROM
        users u
        JOIN lanes l ON
            l."userId" = u."id"
    `,
    onInsert: function(args) {
      console.log(args)
    },
    onDelete: function(args) {
      console.log(args)
    },
    onUpdate: function(args) {
      console.log(args)
    }
  })
}
