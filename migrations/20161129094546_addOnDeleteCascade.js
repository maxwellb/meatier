
const upQueries = [
  `
  ALTER TABLE lanes
  DROP CONSTRAINT lanes_userid_foreign,
  ADD CONSTRAINT lanes_userid_foreign
     FOREIGN KEY ("userId") REFERENCES users(id)
     ON DELETE CASCADE;
  `,
  `
  ALTER TABLE notes
  DROP CONSTRAINT notes_laneid_foreign,
  ADD CONSTRAINT notes_laneid_foreign
     FOREIGN KEY ("laneId") REFERENCES lanes(id)
     ON DELETE CASCADE;
  `
]

const downQueries = [
  `
  ALTER TABLE lanes
  DROP CONSTRAINT lanes_userid_foreign,
  ADD CONSTRAINT lanes_userid_foreign
     FOREIGN KEY ("userId") REFERENCES users(id);
  `,
  `
  ALTER TABLE notes
  DROP CONSTRAINT notes_laneid_foreign,
  ADD CONSTRAINT notes_laneid_foreign
     FOREIGN KEY ("laneId") REFERENCES lanes(id);
  `
]

exports.up = function(knex, Promise) {
  return Promise.all(upQueries.map( (query) => knex.raw(query) ))
};

exports.down = function(knex, Promise) {
  return Promise.all(downQueries.map( (query) => knex.raw(query) ))
};
