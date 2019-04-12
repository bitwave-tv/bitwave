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

  setUserCookie(state, user) {
    if (user) Cookie.set('user', user);
  },

  setMetaUser(state, data) {
    state.metaUser = data;
  },

};

export const actions = {

  nuxtServerInit ({ commit }, { req, params }) {
    let authUser = null;
    let metaUser = null;
    let user     = null;
    const cookie = req.headers.cookie;
    if (!!cookie) {
      let parsed = null;

      try {
        parsed = cookieparser.parse(cookie);
      } catch (error) {
        console.log(`ERROR: Failed to parse cookie.`);
        console.log(cookie);
      }

      if (!!parsed) {
        try {
          if (!!parsed.auth && !!parsed.user) {
            authUser = JSON.parse(parsed.auth);
            metaUser = JSON.parse(parsed.metaUser);
            user     = JSON.parse(parsed.user);
            console.log(`${user.username} logged in via nuxtServerInit: `, params);
          } else {
            console.log(`User is not logged in.`);
          }
        } catch (error) {
          // No valid cookie found
          console.log(`ERROR: No valid cookie found.`);
          console.log(`ERROR: ${error}`);
          console.log(cookie);
        }
      }
    }
    commit('setAuth', authUser);
    commit('setMetaUser', metaUser);
    commit('setUser', user);
  },

  async nuxtClientInit ({ dispatch }, { req, params }) {
    console.log(`Client Init: ${params}`);
    console.log(`${req}`);

    await dispatch('nuxtServerInit', { req, params });
  },

  async login ({ commit }, user) {
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
      const data = doc.data();
      commit('setUser', data);
      Cookie.set('user', data);
    });
  },

  async logout ({ commit }) {
    try {
      if (unsubscribeUser) unsubscribeUser();
      await auth.signOut();

      commit('setUser', null);
      Cookie.remove('user');

      commit('setAuth', null);
      Cookie.remove('auth');

      commit('setMetaUser', null);
      Cookie.remove('metaUser');
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  },

};
