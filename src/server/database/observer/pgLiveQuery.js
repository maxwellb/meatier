import "babel-polyfill";
import {Pool} from 'pg'
import LiveQuery from 'pg-live-query'
// import knex from '../knexDriver'
const pool = new Pool({
  user: 'theophile',
  host: 'localhost',
  database: 'meatier-pg',
  max: 10,
  idleTimeoutMillis: 1000, // close & remove clients which have been idle > 1 second
});
let client
let lq
export async function liveQuery({query, onInsert, onUpdate, onDelete}) {
  client = client ? client : await pool.connect()
  lq = lq ? lq : new LiveQuery(client)
  console.log("Live query watching", query)
  const handle = lq.watch(query)
  handle.on('insert', (id, row, cols) => {
    const inserted = getObject(id, row, cols)
    onInsert({id, inserted})
  });
  handle.on('update', (id, row, cols) => {
    const updated = getObject(id, row, cols)
    onUpdate({id, updated})
  });
  // The "delete" event only contains the id
  handle.on('delete', (id) => {
    onDelete({id})
  });
}

export async function unwatch() {
  client.release()
  pool.end()
}

function getObject(id, row, cols) {
  const out = {};
  cols.forEach((col, i) => {
      out[col] = row[i] || null;
  });
  return out
}
