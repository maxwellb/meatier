import knex from 'knex'
const knexFile = require('../../../knexfile.js')
export default knex(knexFile.development)
