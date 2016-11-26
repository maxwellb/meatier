// import {Pool} from 'pg'
import LiveQuery from 'pg-live-query'
import knex from '../knexDriver'

export default async function pgLiveQuery(query, changeCallback) {
  // const pool = new Pool({
  //   user: 'theophile',
  //   host: 'localhost',
  //   database: 'meatier-pg',
  //   max: 10, // max number of clients in pool
  //   idleTimeoutMillis: 1000, // close & remove clients which have been idle > 1 second
  // }); // Or however you set up pg

  // pool.on('error', function (err, client) {
  //   // if an error is encountered by a client while it sits idle in the pool
  //   // the pool itself will emit an error event with both the error and
  //   // the client which emitted the original error
  //   // this is a rare occurrence but can happen if there is a network partition
  //   // between your application and the database, the database restarts, etc.
  //   // and so you might want to handle it and at least log it out
  //   console.error('idle client error', err.message, err.stack)
  // })
  // pool.connect((error, client, done) => {
  knex.client.acquireConnection((connection) => {
    const lq = new LiveQuery(connection);
    const unsubscribeCallback = function() {
      // delete lq
      knex.client.releaseConnection(connection)
    }
    // const query = `
    // SELECT
    // *
    // FROM
    // lanes
    // `;
    // const changeCallback = (changes) => {
    //     changes.forEach(({ id, rn, data }) => {
    //         if(data) {
    //             console.log(`upsert: ${id} at row ${rn}`, data);
    //         }
    //         else {
    //             console.log(`delete: ${id}`);
    //         }
    //     })
    // }
    // To get 'insert', 'update', 'delete', and 'changes' events
    console.log(query)
    const handle = lq.watch(query);
    // The "changes" event contains several changes batched together
    handle.on('changes', (changes) => changeCallback({changes, unsubscribeCallback}));
  })

}
