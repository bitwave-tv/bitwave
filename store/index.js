import { auth, db } from '@/plugins/firebase.js';

let unsubscribeUser = null;

export const state = () => ({
  auth: null,
  user: null,
  metaUser: null,
  channel: null,
  chatToken: null,
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
  },

  getChatToken : state => {
    return state.chatToken;
  },

  getStreamkey ( state ) {
    if ( state.user.hasOwnProperty( 'streamkey' ) ) {
      return state.user.streamkey;
    }
    return null;
  },

};

export const mutations = {

  setAuth( state, auth ) {
    state.auth = auth
  },

  setUser( state, user ) {
    state.user = user;
  },

  setUserCookie( state, user ) {
    if ( user ) this.$cookies.set( 'user', user );
    else console.log( `Tried to update cookie, but user is not set.` );
  },

  setMetaUser( state, data ) {
    state.metaUser = data;
  },

  setAvatar( state, url ) {
    state.user = {

    }
  },

  setChannel ( state, channel ) {
    state.channel = channel;
  },

  setChatToken ( state, token ) {
    state.chatToken = token;
  },

};

export const actions = {

  nuxtServerInit ({ commit }, { req, params }) {
    let authUser = null;
    let metaUser = null;
    let user     = null;

    const cookies = this.$cookies.getAll();

    if ( !!cookies ) {
      try {
        if ( !!cookies.auth && !!cookies.user ) {
          authUser = cookies.auth;
          metaUser = cookies.metaUser;
          user     = cookies.user;
          console.log( `${user.username} logged in via nuxtServerInit: `, params );
        } else {
          console.log( `User is not logged in.`, params );
        }
      } catch ( error ) {
        console.log( `ERROR: No valid cookie found.`, error );
        console.log( `Cookies:`, cookies );
      }
    }
    commit( 'setAuth', authUser );
    commit( 'setMetaUser', metaUser );
    commit( 'setUser', user );
  },

  async nuxtClientInit ({ dispatch }, { req, params }) {
    console.log(`Client Init: ${params}`);
    console.log(`${req}`);

    await dispatch('nuxtServerInit', { req, params });
  },

  async login ({ dispatch, commit }, user) {
    const token = await user.getIdToken();
    const refreshToken = user.refreshToken;
    const uid = user.uid;

    const _auth = {
      accessToken: token,
      refreshToken: refreshToken,
      uid: uid,
    };

    commit('setAuth', _auth);
    this.$cookies.set('auth', _auth);

    user =  JSON.parse(JSON.stringify(user));

    commit('setMetaUser', user);
    this.$cookies.set('metaUser', user);

    const userdocRef = db.collection('users').doc(uid);
    unsubscribeUser = userdocRef.onSnapshot( doc => {
      const data = doc.data();
      commit('setUser', data);
      this.$cookies.set('user', data);
    });

    if ( process.client )
      console.log(`%cSTORE:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', user);

    await dispatch ( 'exchangeIdTokenChatToken', token );
  },

  async logout ({ commit }) {
    try {
      if (unsubscribeUser) unsubscribeUser();
      await auth.signOut();

      commit('setUser', null);
      this.$cookies.remove('user');

      commit('setAuth', null);
      this.$cookies.remove('auth');

      commit('setMetaUser', null);
      this.$cookies.remove('metaUser');

      console.log('Logged Out');
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

  async exchangeIdTokenChatToken ({ store, commit }, idToken) {
    try {
      const { data } = await this.$axios.post( `https://api.bitwave.tv/api/token`, { token: idToken } );
      commit('setChatToken', data.chatToken);
      // console.log( `%cSTORE:%c Got ChatToken! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', data.chatToken );
    } catch ( error ) {
      console.log( `%cSTORE:%c ERROR: Failed to exchange token! %o`, 'background: red; color: #fff; border-radius: 3px; padding: .25rem;', '', error );
    }

  },

};
