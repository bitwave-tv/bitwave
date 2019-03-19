/*
import firebase from 'firebase/app';
import 'firebase/auth';

export const state = {
  currentUser: {}
};

export const mutations = {
  SET_USER (state, { user }) {
    state.currentUser = user;
  },
  UNSET_USER () {
    state.currentUser = {};
  }
};

export const actions = {
  init ({ commit, rootState }) {
    if (process.server) return;
    rootState.app.auth().onAuthStateChanged((user) => {
      if (user) {
        commit('SET_USER', { user });
      } else {
        commit('UNSET_USER');
      }
    });
  },
  login ({ rootState }) {
    const authProvider = new firebase.auth.GoogleAuthProvider();
    return rootState.app.auth().signInWithPopup(authProvider);
  },
  logout ({ rootState }) {
    rootState.app.auth().signOut();
  }
};

export default { namespaced: true, state, mutations, actions };
*/
