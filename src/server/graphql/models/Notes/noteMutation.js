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
      // note.createdAt = new Date();
      const newNote = await knex('notes').returning(Object.keys(note)).insert(note);
      console.log(newNote)
      if (newNote.length && newNote.Length === 1) {
        return newNote[0]
      } else {
        throw errorObj({_error: 'Could not add note'});
      }
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
      const updatedNote = await knex('notes')
        .returning(Object.keys(note))
        .where('id', '=', note.id)
        .update(updates)

      if (updatedNote.length && updatedNote.Length === 1) {
        return updatedNote[0]
      } else {
        throw errorObj({_error: 'Could not add note'});
      }
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
