import { auth, db } from '@/plugins/firebase.js';
import axios from 'axios';

let unsubscribeUser = null;


// Define Store
const $states = {
  auth : 'AUTH',
  user : 'USER',

  channel   : 'CHANNEL',
  chatToken : 'CHAT_TOKEN',

  sidebarData : 'SIDEBAR_DATA',
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

  getSidebarData : 'GET_SIDEBAR_DATA',
};

const $mutations = {
  setAuth : 'SET_AUTH',
  setUser : 'SET_USER',

  setChatToken : 'SET_CHAT_TOKEN',

  setSidebarData : 'SET_SIDEBAR_DATA',
};

const $actions = {
  exchangeIdTokenChatToken : 'exchangeIdTokenChatToken',

  registerUser : 'REGISTER_USER',
  loginUser    : 'LOGIN_USER',
  login        : 'LOGIN',
  logout       : 'LOGOUT',

  fetchSidebarData : 'FETCH_SIDEBARE',
};


// Create Store
export const state = () => ({
  [$states.auth]        : null,
  [$states.user]        : null,
  [$states.channel]     : null,
  [$states.chatToken]   : null,
  [$states.sidebarData] : [],
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
    return state[$states.auth]
      ?  state[$states.auth].uid
      : null;
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
    return state[$states.user]
      ? state[$states.user].hasOwnProperty( 'streamkey' )
        ? state[$states.user].streamkey
        : null
      : null;
  },

  [$getters.getSidebarData] ( state ) {
    return state[$states.sidebarData].slice( 0, 25 );
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

  [$mutations.setSidebarData] ( state, data ) {
    state[$states.sidebarData] = data;
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
  async nuxtServerInit ({ dispatch, commit }, { req, params }) {
    let authUser = null, user = null;
    const cookies = this.$cookies.getAll();
    if ( cookies ) {
      try {
        if ( cookies.auth && cookies.user ) {
          authUser = cookies.auth;
          user     = cookies.user;
          console.log( `${user.username} logged in via nuxtServerInit: `, params );
        } else {
          console.log( `User is not logged in.`, params );
        }
      } catch ( error ) {
        console.log( `ERROR: No valid cookie found.`, error );
      }
    }
    commit( $mutations.setAuth, authUser );
    commit( $mutations.setUser, user );

    await dispatch( $actions.fetchSidebarData );
  },

  async nuxtClientInit ({ dispatch }, { req, params }) {
    console.log( `Client Init: ${params}` );
    console.log( `${req}` );
    await dispatch( 'nuxtServerInit', { req, params } );
  },

  // not used due since we couldn't catch errors well here
  async [$actions.registerUser] ({ dispatch, commit }, { credential, stayLoggedIn }) {
    // Create user & update credential
    const userCredential = await auth.createUserWithEmailAndPassword( credential.email, credential.password );
    await userCredential.user.updateProfile({ displayName: credential.username });

    // Create user document
    const userId = userCredential.user.uid;
    await db.collection( 'users' ).doc( userId ).set({
      _username: credential.username.toLowerCase(),
      uid: userId,
      username: credential.username,
      email: credential.email,
    });
    return true;
  },

  // not used due since we couldn't catch errors well here
  async [$actions.loginUser] ({ dispatch, commit }, { credential, stayLoggedIn }) {
    await auth.setPersistence( stayLoggedIn ? 'local' : 'session' ); // firebase.auth.Auth.Persistence.SESSION
    await auth.signInWithEmailAndPassword( credential.email, credential.password );
    // const userCredential = await auth.signInWithEmailAndPassword( credential.email, credential.password );
    // await dispatch ( $actions.storeUserData, userCredential );
  },

  async [$actions.login] ({ dispatch, commit }, user) {
    const token = await user.getIdToken();
    const uid = user.uid;

    const auth = {
      accessToken: token,
      uid: uid,
    };

    commit( $mutations.setAuth, auth );
    this.$cookies.set( 'auth',  auth );

    user =  JSON.parse( JSON.stringify( user ) );

    if ( unsubscribeUser ) {
      console.warn( 'Already had firebase listener!' );
      unsubscribeUser();
    }

    const userdocRef = db.collection( 'users' ).doc( uid );
    unsubscribeUser = userdocRef.onSnapshot( async doc => {
      const data = doc.data();
      if ( process.env.APP_DEBUG )  console.log( 'User updated', data );
      commit( $mutations.setUser, data );
      this.$cookies.set( 'user',  data );
    });

    if ( process.client )
      console.log( `%cSTORE:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', user );

    await dispatch ( $actions.exchangeIdTokenChatToken, token );
  },

  async [$actions.logout] ({ commit }) {
    try {
      if ( unsubscribeUser ) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      await auth.signOut();

      commit( $mutations.setUser, null );
      commit( $mutations.setAuth, null );

      this.$cookies.remove( 'user' );
      this.$cookies.remove( 'auth' );

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

  async [$actions.fetchSidebarData] ({ commit }) {
    try {
      const { data } = await axios.get( 'https://api.bitwave.tv/api/channels/list' );
      commit ( $mutations.setSidebarData, data.users );
    } catch ( error ) {
      console.error( `ERROR: Failed to update user list.` );
      console.log( error.message );
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
