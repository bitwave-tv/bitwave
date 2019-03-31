import { auth, db } from '@/plugins/firebase.js';

const cookieparser = process.server ? require('cookieparser') : undefined;
const Cookie = process.client ? require('js-cookie') : undefined;

let unsubscribeUser = null;

export const state = () => ({

  auth: null,
  user: null,
  metaUser: null,

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

  setMetaUser(state, data) {
    state.metaUser = data;
  },

};

export const actions = {

  nuxtServerInit({ commit }, { req }) {
    let auth = null;
    let metaUser = null;
    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie);
      // console.log('\n - - - - - Cookie Parsed - - - - -');
      // console.log(parsed);
      try {
        auth = JSON.parse(parsed.auth);
        console.log('\n - - - - - Cookie Object - AUTH - - - - -');
        console.log(auth);

        metaUser = JSON.parse(parsed.metaUser);
        console.log('\n - - - - - Cookie Object - User - - - - -');
        console.log(metaUser);
      } catch (error) {
        // No valid cookie found
        console.log(`ERROR: No cookie found.`);
        console.log(`ERROR: ${error}`);
      }
    }
    commit('setAuth', auth);
  },

  async login({ commit }, user) {
    const token = await user.getIdToken();
    const refreshToken = user.refreshToken;
    const uid = user.uid;

    const _auth = {
      accessToken: token,
      refreshToken: refreshToken,
      uid: uid,
    };

    commit('setAuth', _auth);
    Cookie.set('auth', _auth);

    const _user = user.toJSON();

    commit('setMetaUser', _user);
    Cookie.set('metaUser', _user);

    const userdocRef = db.collection('users').doc(uid);
    unsubscribeUser = userdocRef.onSnapshot( doc => {
      commit('setUser', doc.data());
    });
  },

  async logout({ commit }) {
    try {
      if (unsubscribeUser) unsubscribeUser();
      await auth.signOut();

      commit('setUser', null);

      commit('setAuth', null);
      Cookie.remove('auth');

      commit('setMetaUser', null);
      Cookie.remove('metaUser');
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  },

};
