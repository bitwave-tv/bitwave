import { auth, db } from '@/plugins/firebase.js';
import axios from 'axios';
import { Chat } from '@/store/chat';

let unsubscribeUser = null;


// Define Store
const $states = {
  auth : 'AUTH',
  user : 'USER',

  channel   : 'CHANNEL',

  sidebarData : 'SIDEBAR_DATA',
  newVersion  : 'LATEST_VERSION',

  alerts: 'SYSTEM_ALERT',
  featureFlags : 'FEATURE_FLAGS',

  channelsViewers : 'CHANNEL_VIEWERS',
  userlist        : 'USERLIST',

  pinToLive : 'PIN_TO_LIVE',
};

const $getters = {
  isAuth       : 'IS_AUTH',
  isStreamer   : 'IS_STREAMER',
  isAdmin      : 'IS_ADMIN',
  getAuth      : 'GET_AUTH',
  getUID       : 'GET_UID',
  getUser      : 'GET_USER',
  getUsername  : 'GET_USERNAME',
  getStreamKey : 'GET_STREAM_KEY',
  getBalance   : 'GET_BALANCE',
  getChannel   : 'GET_CHANNEL',

  getSidebarData : 'GET_SIDEBAR_DATA',
  isUpdateAvailable : 'IS_UPDATE_AVAILABLE',

  getAlerts: 'GET_SYSTEM_ALERT',
  getFeatureFlag: 'GET_FEATURE_FLAG',

  getChannelViews : 'GET_CHANNEL_VIEWS',
  getUserList     : 'GET_USERLIST',
  getUserCount    : 'GET_USER_COUNT',
};

const $mutations = {
  setAuth : 'SET_AUTH',
  setUser : 'SET_USER',

  setSidebarData : 'SET_SIDEBAR_DATA',
  setNewVersion : 'SET_LATEST_VERSION',

  setAlerts: 'SET_SYSTEM_ALERT',
  setFeatureFlags : 'SET_FEATURE_FLAGS',

  setChannelViewers : 'SET_CHANNEL_VIEWERS',
  setUserList       : 'SET_USER_LIST',

  setPinToLive : 'SET_PIN_TO_LIVE',
};

const $actions = {
  registerUser : 'REGISTER_USER',
  loginUser    : 'LOGIN_USER',
  login        : 'LOGIN',
  logout       : 'LOGOUT',

  fetchSidebarData : 'FETCH_SIDEBAR',
  newVersionAvailable : 'NEW_VERSION_AVAILABLE',

  updateAlerts : 'CHECK_FOR_ALERTS',
  updateFeatureFlags : 'UPDATE_FEATURE_FLAGS',

  updateViewers : 'UPDATE_VIEWERS',
};


// Create Store
export const state = () => ({
  [$states.auth]        : null,
  [$states.user]        : null,
  [$states.channel]     : null,
  [$states.sidebarData] : [],
  [$states.newVersion]  : null,
  [$states.alerts]      : {},
  [$states.featureFlags]: {},

  [$states.channelsViewers] : [],
  [$states.userlist]        : [],

  [$states.pinToLive] : false,
});


// Getters
export const getters = {
  [$getters.isAuth] : state => {
    return !!state[$states.auth];
  },

  [$getters.isStreamer] : state => {
    return state[$states.user]
      && state[$states.user].hasOwnProperty( 'streamkey' );
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

  [$getters.getFeatureFlag] ( state ) {
    return featureName => {
      if ( !featureName ) return false;
      if ( state[$states.featureFlags] && state[$states.featureFlags].hasOwnProperty(featureName) )
        return state[$states.featureFlags][featureName];
      else
        return false;
    };
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

  [$getters.isAdmin] ( state ) {
    const user = state[$states.user];
    return user
      && user.hasOwnProperty( 'role' )
      && user.role === 'admin';
  },

  [$getters.getBalance] ( state ) {
    const user = state[$states.user];
    return user
      && user.hasOwnProperty( 'balance' )
      && user.balance
      || 0;
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

  [$mutations.setSidebarData] ( state, data ) {
    state[$states.sidebarData] = data;
  },

  [$mutations.setNewVersion] ( state, data ) {
    state[$states.newVersion] = data;
  },

  [$mutations.setAlerts] ( state, data ) {
    state[$states.alerts] = data;
  },

  [$mutations.setFeatureFlags] ( state, data ) {
    state[$states.featureFlags] = data;
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

  [$mutations.setPinToLive] ( state, data ) {
    state[$states.pinToLive] = data;
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

      // cookie for global chat hydration flag
      if ( cookies._bw_global !== undefined ) {
        commit( `${Chat.namespace}/${Chat.$mutations.setGlobalSSR}`, cookies._bw_global );
      }
    }
    commit( $mutations.setAuth, authUser );
    commit( $mutations.setUser, user );

    await dispatch( $actions.fetchSidebarData );

    // Chat user hydration data
    dispatch( $actions.updateViewers );

    dispatch( `${Chat.namespace}/${Chat.$actions.updateEmoteList}` );
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
  },

  async [$actions.logout] ({ dispatch, commit }) {
    console.log( 'Logging Out...' );
    try {
      if ( unsubscribeUser ) {
        await unsubscribeUser();
        unsubscribeUser = null;
      }

      await auth.signOut();

      this.$cookies.remove( 'user' );
      this.$cookies.remove( 'auth' );

      // Clear store login data
      commit( $mutations.setUser, null );
      commit( $mutations.setAuth, null );

      // Triggers actions in child stores
      await dispatch( `${Chat.namespace}/${Chat.$actions.logout}` );

      console.log( '%cSTORE:%c Logged Out', 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '' );
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

  async [$actions.fetchSidebarData] ({ commit }) {
    try {
      const { data } = await axios.get( 'https://api.bitwave.tv/api/channels/live' );
      commit ( $mutations.setSidebarData, data.users );
    } catch ( error ) {
      console.error( `${error.message}: Failed to update user list.`, error );
    }
  },

  async [$actions.newVersionAvailable] ( { commit }, latestVersions ) {
    const currentVersion = process.env.VERSION;
    const newVersion = currentVersion < latestVersions[ process.env.BITWAVE_ENV ]
      ? latestVersions[process.env.BITWAVE_ENV]
      : false;
    if ( newVersion ) {
      console.log( `An update is available! [${newVersion}]` );
      setTimeout( () => {
        commit( $mutations.setNewVersion, newVersion );
        this.$toast.global.update( { message: `[ v${newVersion} ] A new version of bitwave is available` } );
      }, 2500);
    } else {
      this.$toast.clear();
    }
  },

  async [$actions.updateAlerts] ( { commit }, alerts ) {
    console.log( 'Alerts updated!', alerts );
    setTimeout( () => {
      commit( $mutations.setAlerts, alerts );
    }, 1000);
  },

  async [$actions.updateFeatureFlags] ( { commit }, featureFlags ) {
    console.log( 'Feature Flags updated!', featureFlags );
    commit( $mutations.setFeatureFlags, featureFlags );
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
