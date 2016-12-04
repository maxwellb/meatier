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
export async function liveQuery({query, onChange}) {
  try {
    client = client ? client : await pool.connect()
    lq = lq ? lq : new LiveQuery(client)
    console.log("Live query watching", query)
    const handle = lq.watch(query)
    const set = {}
    handle.on('insert', (id, row, cols) => {
      const response = formalize('insert', {id, row, cols})
      set[id] = response.data
      onChange(response)
    })
    handle.on('update', (id, row, cols) => {
      const response = formalize('update', {id, row, cols})
      set[id] = response.data
      onChange(response)
    })
    // The "delete" event only contains the id
    handle.on('delete', (id) => {
      const response = formalize('delete', {id})
      response.data = set[id]
      delete set[id]
      onChange(response)
    })
    handle.on('error', (err) => {
      console.error({err})
    })
  } catch(e) {
    console.log("Big error",e)
  }

}

export function unwatch() {
  console.log("unwatch")
  client.release()
}

function formalize(type, {id, row, cols}) {
  let data = {}
  if (row && cols) {
    cols.forEach((col, i) => {
        data[col] = row[i] || null;
    })
  }
  return {type, data, id}
}
