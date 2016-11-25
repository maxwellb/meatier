var pgp = require('pg-promise')();
import PgTableObserver from 'pg-table-observer';
const connection = 'postgresql://theophile@localhost:5432/meatier-pg';

export default async function pgObserver() {
  try {
    let db = await pgp(connection);
    process.on('unhandledRejection', (err, p) => console.log(err.stack));

    let table_observer = new PgTableObserver(db, '123app');
    console.log("connection is now up")
    async function cleanupAndExit() {
      await table_observer.cleanup();
      pgp.end();
      process.exit();
    }

    process.on('SIGTERM', cleanupAndExit);
    process.on('SIGINT', cleanupAndExit);

    // Multiple tables can be specified as an array

    let notify = await table_observer.notify(['lanes'], change => {
      console.log("notify")
      console.log(change);
    });
    // ... when finished observing the table

    await notify.stop();
    // ... when finished observing altogether

    // await table_observer.cleanup();
  }
  catch(err) {
    console.error(err);
  }
}
