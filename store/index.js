import { auth, db } from '@/plugins/firebase.js';

let unsubscribeUser = null;


// Define Store
const $states = {
  auth : 'AUTH',
  user : 'USER',

  metaUser  : 'META_USER', // TODO: Get rid of this

  channel   : 'CHANNEL',
  chatToken : 'CHAT_TOKEN',
};

const $getters = {
  isAuth       : 'IS_AUTH',
  getAuth      : 'GET_AUTH',
  getUID       : 'GET_UID',
  getUser      : 'GET_USER',
  getUsername  : 'GET_USERNAME',
  getChatToken : 'GET_CHAT_TOKEN',
  getStreamKey : 'GET_STREAM_KEY',
  getChannel   : 'GET_CHANNEL',
};

const $mutations = {
  setAuth : 'SET_AUTH',
  setUser : 'SET_USER',

  setMetaUser : 'SET_META_USER', // TODO: Get rid of this

  setChatToken : 'SET_CHAT_TOKEN',
};

const $actions = {
  exchangeIdTokenChatToken : 'exchangeIdTokenChatToken',

  login  : 'LOGIN',
  logout : 'LOGOUT',
};


// Create Store
export const state = () => ({
  [$states.auth]      : null,
  [$states.user]      : null,
  [$states.metaUser]  : null,
  [$states.channel]   : null,
  [$states.chatToken] : null,
});


// Getters
export const getters = {
  [$getters.isAuth] : state => {
    return !!state[$states.auth];
  },

  [$getters.getAuth] : state => {
    return state[$states.auth];
  },

  [$getters.getUID] : state => {
    return state[$states.auth].uid;
  },

  [$getters.getUser] : state => {
    return state[$states.user];
  },

  [$getters.getUsername] : state => {
    if ( state[$states.user] ) return state[$states.user].username || null;
    else return null;
  },

  [$getters.getChannel] : state => {
    if ( !state[$states.channel] ) return 'global';
    else return state[$states.channel];
  },

  [$getters.getChatToken] : state => {
    return state[$states.chatToken];
  },

  [$getters.getStreamKey] ( state ) {
    if ( state[$states.user].hasOwnProperty( 'streamkey' ) ) {
      return state[$states.user].streamkey;
    }
    return null;
  },
};


// Mutations
export const mutations = {
  [$mutations.setAuth] ( state, auth ) {
    state[$states.auth] = auth
  },

  [$mutations.setUser] ( state, user ) {
    state[$states.user] = user;
  },

  [$mutations.setMetaUser] ( state, data ) {
    state[$states.metaUser] = data;
  },

  [$mutations.setChatToken] ( state, token ) {
    state[$states.chatToken] = token;
  },

  setAvatar( state, url ) {
    state[$states.user] = {

    }
  },

  setChannel ( state, channel ) {
    state[$states.channel] = channel;
  },
};


// Actions
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

    commit( $mutations.setAuth, authUser );
    commit( $mutations.setMetaUser, metaUser );
    commit( $mutations.setUser, user );
  },

  async nuxtClientInit ({ dispatch }, { req, params }) {
    console.log( `Client Init: ${params}` );
    console.log( `${req}` );

    await dispatch( 'nuxtServerInit', { req, params } );
  },

  async [$actions.login] ({ dispatch, commit }, user) {
    const token = await user.getIdToken();
    const refreshToken = user.refreshToken;
    const uid = user.uid;

    const _auth = {
      accessToken: token,
      refreshToken: refreshToken,
      uid: uid,
    };

    commit( $mutations.setAuth, _auth );
    this.$cookies.set( 'auth', _auth );

    user =  JSON.parse( JSON.stringify( user ) );

    commit( $mutations.setMetaUser, user );
    this.$cookies.set( 'metaUser', user );

    const userdocRef = db.collection( 'users' ).doc( uid );
    unsubscribeUser = userdocRef.onSnapshot( doc => {
      const data = doc.data();
      commit( $mutations.setUser, data );
      this.$cookies.set( 'user', data );
    });

    if ( process.client )
      console.log( `%cSTORE:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', user );

    await dispatch ( $actions.exchangeIdTokenChatToken, token );
  },

  async [$actions.logout] ({ commit }) {
    try {
      if ( unsubscribeUser ) unsubscribeUser();
      await auth.signOut();

      commit( $mutations.setUser, null );
      this.$cookies.remove( 'user' );

      commit( $mutations.setAuth, null );
      this.$cookies.remove( 'auth' );

      commit( $mutations.setMetaUser, null );
      this.$cookies.remove( 'metaUser' );

      console.log( 'Logged Out' );
    } catch ( error ) {
      console.log( `ERROR: ${error}` );
    }
  },

  async updateAvatar ({ store, commit }, url) {
    const userId = this.store.user.uid;
    const docRef = db.collection( 'users' ).doc( userId );
    await docRef.set({
      avatar: url,
    }, { merge: true });
    if ( store[$states.user].streamkey ) {
      const stream = store[$states.user].username.toLowerCase();
      const streamRef = db.collection( 'streams' ).doc( stream );
      await streamRef.update({
        'user.avatar': url,
      });
    }
  },

  async [$actions.exchangeIdTokenChatToken] ({ store, commit }, idToken) {
    try {
      const { data } = await this.$axios.post( `https://api.bitwave.tv/api/token`, { token: idToken } );
      commit( $mutations.setChatToken, data.chatToken );
      // console.log( `%cSTORE:%c Got ChatToken! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', data.chatToken );
    } catch ( error ) {
      console.log( `%cSTORE:%c ERROR: Failed to exchange token! %o`, 'background: red; color: #fff; border-radius: 3px; padding: .25rem;', '', error );
    }
  },
};


// Export Store Structure
export const VStore = {
  $states,
  $getters,
  $mutations,
  $actions,
};
