import {Note, NewNote, UpdatedNote} from './noteSchema';
import {errorObj} from '../utils';
import {isLoggedIn} from '../authorization';
import {GraphQLNonNull, GraphQLBoolean, GraphQLID} from 'graphql';
import knex from '../../../database/knexDriver';

export default {
  addNote: {
    type: Note,
    args: {
      note: {type: new GraphQLNonNull(NewNote)}
    },
    async resolve(source, {note}, {authToken}) {
      isLoggedIn(authToken);
      note.createdAt = new Date();
      const newNote = await knex('notes').returning(note.keys()).insert(note);
      if (newNote.errors) {
        throw errorObj({_error: 'Could not add note'});
      }
      return newNote;
    }
  },
  updateNote: {
    type: Note,
    args: {
      note: {type: new GraphQLNonNull(UpdatedNote)}
    },
    async resolve(source, {note}, {authToken}) {
      isLoggedIn(authToken);
      note.updatedAt = new Date();
      const {id, ...updates} = note;
      const updatedNote = knex('notes')
        .returning(note.keys())
        .where('id', '=', note.id)
        .update(updates)
        .then(function(res) {
          console.log({inserted: true})
        }).catch(function(err) {
          console.log(err)
          throw errorObj({_error: 'Could not update note'});
        })
      if (updatedNote.errors) {
        throw errorObj({_error: 'Could not update note'});
      }
      return updatedNote;
    }
  },
  deleteNote: {
    type: GraphQLBoolean,
    args: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, {id}, {authToken}) {
      isLoggedIn(authToken);
      const result = await knex('notes').where({id}).del()
      // return true is delete succeeded, false if doc wasn't found
      return result > 0;
    }
  }
};
