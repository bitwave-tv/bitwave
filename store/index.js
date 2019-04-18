import { auth, db } from '@/plugins/firebase.js';

const cookieparser = process.server ? require('cookieparser') : undefined;
const Cookie = process.client ? require('js-cookie') : undefined;

let unsubscribeUser = null;

export const state = () => ({

  auth: null,
  user: null,
  metaUser: null,
  channel: null,

});

export const getters = {

  isAuth : state => {
    return !!state.auth;
  },

  user : state => {
    return state.user;
  },

  username : state => {
    if (state.user) return state.user.username || null;
    else return null;
  },

  channel : state => {
    if (!state.channel) return 'global';
    else return state.channel;
  }

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
    else console.log(`Tried to update cookie, but user is not set.`);
  },

  setMetaUser(state, data) {
    state.metaUser = data;
  },

  setAvatar(state, url) {
    state.user = {

    }
  },

  setChannel (state, channel) {
    state.channel = channel;
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
            console.log(`User is not logged in.`, params);
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

    user =  JSON.parse(JSON.stringify(user));

    commit('setMetaUser', user);
    Cookie.set('metaUser', user);

    const userdocRef = db.collection('users').doc(uid);
    unsubscribeUser = userdocRef.onSnapshot( doc => {
      const data = doc.data();
      commit('setUser', data);
      Cookie.set('user', data);
    });

    if (process.client)
      console.log(`%STORE:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', user);
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

  async updateAvatar ({ store, commit }, url) {
    const userId = this.store.user.uid;
    const docRef = db.collection('users').doc(userId);
    await docRef.set({
      avatar: url,
    }, { merge: true });
    if (this.store.user.streamkey) {
      const stream = this.store.user.username.toLowerCase();
      const streamRef = db.collection('streams').doc(stream);
      await streamRef.update({
        'user.avatar': url,
      });
    }
  },

};
