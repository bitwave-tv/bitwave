import { auth, db } from '@/plugins/firebase.js';

const cookieparser = process.server ? require('cookieparser') : undefined;
const Cookie = process.client ? require('js-cookie') : undefined;

let unsubscribeUser = null;

export const state = () => ({

  auth: null,
  user: null,

});

export const getters = {

  isAuth : state => {
    return !!state.auth;
  },

};

export const mutations = {

  setAuth(state, auth) {
    state.auth = auth
  },

  setUser(state, user) {
    state.user = user;
  },

};

export const actions = {

  nuxtServerInit({ commit }, { req }) {
    let auth = null;
    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie);
      try {
        auth = JSON.parse(parsed.auth);
      } catch (err) {
        // No valid cookie found
      }
    }
    commit('setAuth', auth);
  },

  async login({ commit }, user) {
    const token = await user.getIdToken();
    const uid = user.uid;

    const _auth = {
      accessToken: token,
      uid: uid,
    };

    commit('setAuth', _auth);
    Cookie.set('auth', _auth);

    const userdocRef = db.collection('users').doc(uid);
    unsubscribeUser = userdocRef.onSnapshot( doc => {
      commit('setUser', doc.data());
    });
  },

  async logout({ commit }) {
    if (unsubscribeUser) unsubscribeUser();
    commit('setUser', null);

    commit('setAuth', null);
    Cookie.remove('auth');

    await auth.signOut();
  },

};
