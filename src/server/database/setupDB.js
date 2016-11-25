import knex from './knexDriver';

export default async function setupDB(isUpdate = false) {
  await reset()
  console.log(`>>Database setup complete!`);
}

async function reset() {
  await createTable('users', function(table) {
    table.increments('id').primary();
    table.string('email')
    table.boolean('isVerified')
    table.string('firstName')
    table.string('lastName')
    table.string('picture')
    table.string('gender')
    table.string('locale')
    table.string('password')
    table.string('verifiedEmailToken')
    table.string('resetToken')
    table.timestamps();
  });
  await createTable('lanes', function(table) {
    table.increments('id').primary()
    table.integer('userId').references('id').inTable('users')
    table.boolean('isPrivate')
    table.string('title')
    table.timestamps()
  });
  await createTable('notes', function(table) {
    table.increments('id').primary();
    table.integer('userId').references('id').inTable('users')
    table.integer('laneId').references('id').inTable('lanes')
    table.string('title');
    table.string('index');
    table.timestamps();
  });

  console.log(`>>Setup complete`);
}

async function createTable(name, callback) {
  return knex.schema.createTableIfNotExists(name, callback)
  .then(function(res) {
    console.log('OK:', res);
  }).catch(function(err) {
    console.log('ERR:', err.message);
  })
}
