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
  newVersion  : 'LATEST_VERSION',

  alerts: 'SYSTEM_ALERT',

  channelsViewers : 'CHANNEL_VIEWERS',
  userlist        : 'USERLIST',
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
  isUpdateAvailable : 'IS_UPDATE_AVAILABLE',

  getAlerts: 'GET_SYSTEM_ALERT',

  getChannelViews : 'GET_CHANNEL_VIEWS',
  getUserList     : 'GET_USERLIST',
  getUserCount    : 'GET_USER_COUNT',
};

const $mutations = {
  setAuth : 'SET_AUTH',
  setUser : 'SET_USER',

  setChatToken : 'SET_CHAT_TOKEN',

  setSidebarData : 'SET_SIDEBAR_DATA',
  setNewVersion : 'SET_LATEST_VERSION',

  setAlerts: 'SET_SYSTEM_ALERT',

  setChannelViewers : 'SET_CHANNEL_VIEWERS',
  setUserList       : 'SET_USER_LIST',
};

const $actions = {
  exchangeIdTokenChatToken : 'exchangeIdTokenChatToken',

  registerUser : 'REGISTER_USER',
  loginUser    : 'LOGIN_USER',
  login        : 'LOGIN',
  logout       : 'LOGOUT',

  fetchSidebarData : 'FETCH_SIDEBAR',
  newVersionAvailable : 'NEW_VERSION_AVAILABLE',

  updateAlerts : 'CHECK_FOR_ALERTS',

  updateViewers : 'UPDATE_VIEWERS',
};


// Create Store
export const state = () => ({
  [$states.auth]        : null,
  [$states.user]        : null,
  [$states.channel]     : null,
  [$states.chatToken]   : null,
  [$states.sidebarData] : [],
  [$states.newVersion]  : null,
  [$states.alerts]      : {},

  [$states.channelsViewers] : [],
  [$states.userlist]        : [],
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

  [$getters.isUpdateAvailable] ( state ) {
    return state[$states.newVersion];
  },

  [$getters.getAlerts] ( state ) {
    return state[$states.alerts];
  },

  // Get Channel Viewer Data
  [$getters.getChannelViews] ( state ) {
    return channel => {
      if ( !channel ) return 0;
      const c = state[$states.channelsViewers].find( c => c.channel.toLowerCase() === channel.toLowerCase() );
      return  c && c.viewCount || 0;
    }
  },

  [$getters.getUserList] ( state ) {
    return state[$states.userlist];
  },

  [$getters.getUserCount] ( state ) {
    return state[$states.userlist].length;
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

  [$mutations.setNewVersion] ( state, data ) {
    state[$states.newVersion] = data;
  },

  [$mutations.setAlerts] ( state, data ) {
    state[$states.alerts] = data;
  },

  [$mutations.setChannelViewers] ( state, data ) {
    state[$states.channelsViewers] = data;
  },

  [$mutations.setUserList] ( state, data ) {
    state[$states.userlist] = Object.keys( data ).map( key => {
      return {
        user: key,
        data: data[key].data,
        watching: data[key].watching,
      };
    }).reverse();
  },

  setAvatar( state, url ) {
    state[$states.user] = {}
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

    // Chat user hydration data
    dispatch( $actions.updateViewers );

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

    this.$axios.setToken( token, 'Bearer' );

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
      console.log( `%cSTORE:%c ${error.message}: Failed to exchange token!\n%o`, 'background: red; color: #fff; border-radius: 3px; padding: .25rem;', '', error );
    }
  },

  async [$actions.fetchSidebarData] ({ commit }) {
    try {
      const { data } = await axios.get( 'https://api.bitwave.tv/api/channels/list' );
      commit ( $mutations.setSidebarData, data.users );
    } catch ( error ) {
      console.error( `${error.message}: Failed to update user list.`, error );
    }
  },

  async [$actions.newVersionAvailable] ( { commit }, latestVersions ) {
    const currentVersion = process.env.VERSION;
    const newVersion = currentVersion < latestVersions[process.env.BITWAVE_ENV]
      ? latestVersions[process.env.BITWAVE_ENV]
      : false;
    if ( newVersion ) {
      console.log( `An update is available! [${newVersion}]` );
      setTimeout( () => {
        commit( $mutations.setNewVersion, newVersion );
        this.$toast.global.update( { message: `[ v${newVersion} ] A new version of bitwave is available` } );
      }, 5000);
    } else {
      this.$toast.clear();
    }
  },

  async [$actions.updateAlerts] ( { commit }, alerts ) {
    console.log( 'Alerts updated!', alerts );
    setTimeout( () => {
      commit( $mutations.setAlerts, alerts );
    }, 5000);
  },

  async [$actions.updateViewers] ( { commit } ) {
    try {
      const { data } = await this.$axios.get( 'https://chat.bitwave.tv/v1/channels', { progress: false } );
      commit( $mutations.setChannelViewers,  data.data );
    } catch ( error ) {
      console.log( `Failed to hydrate channels` );
      console.log( error );
    }

    try {
      const { data } = await this.$axios.get( 'https://chat.bitwave.tv/v1/users', { progress: false } );
      commit( $mutations.setUserList, data.data );
    } catch ( error ) {
      console.log( `Failed to hydrate userlist` );
      console.log( error );
    }
  }

};


// Export Store Structure
export const VStore = {
  $states,
  $getters,
  $mutations,
  $actions,
};
