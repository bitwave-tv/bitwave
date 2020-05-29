import { auth, db } from '@/plugins/firebase.js';
import axios from 'axios';
import { Chat } from '@/store/chat';

const logger = ( message, data ) => {
  if ( process.client ) {
    if ( data && typeof data === 'object' )
      console.log( `%cSTORE:%c ${message} %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', data );
    else
      console.log( `%cSTORE:%c ${message}`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '' );
  } else {
    if ( data && typeof data === 'object' )
      console.log( `STORE: ${message} %o`, data );
    else
      console.log( `STORE: ${message}` );
  }
};

let unsubscribeUser = null;


// Define Store
const $states = {
  auth : 'AUTH',
  user : 'USER',

  channel   : 'CHANNEL',

  newVersion  : 'LATEST_VERSION',

  alerts: 'SYSTEM_ALERT',
  featureFlags : 'FEATURE_FLAGS',

  channelsViewers : 'CHANNEL_VIEWERS',
  userlist        : 'USERLIST',
  showAll         : 'SHOW_ALL',

  pwaPrompt: 'PWA_PROMPT',
};

const $getters = {
  isAuth       : 'IS_AUTH',
  isStreamer   : 'IS_STREAMER',
  isPremium    : 'IS_PREMIUM',
  isAdmin      : 'IS_ADMIN',
  getAuth      : 'GET_AUTH',
  getUID       : 'GET_UID',
  getUser      : 'GET_USER',
  getUsername  : 'GET_USERNAME',
  getStreamKey : 'GET_STREAM_KEY',
  getCoins     : 'GET_COINS',
  getChannel   : 'GET_CHANNEL',

  isUpdateAvailable : 'IS_UPDATE_AVAILABLE',

  getAlerts: 'GET_SYSTEM_ALERT',
  getFeatureFlag: 'GET_FEATURE_FLAG',

  getChannelViews : 'GET_CHANNEL_VIEWS',
  getUserList     : 'GET_USERLIST',
  getUserCount    : 'GET_USER_COUNT',
  getShowAll      : 'GET_SHOW_ALL',

  getPWaPrompt: 'GET_PWA_PROMPT',
};

const $mutations = {
  setAuth : 'SET_AUTH',
  setUser : 'SET_USER',

  setNewVersion : 'SET_LATEST_VERSION',

  setAlerts: 'SET_SYSTEM_ALERT',
  setFeatureFlags : 'SET_FEATURE_FLAGS',

  setChannelViewers : 'SET_CHANNEL_VIEWERS',
  setUserList       : 'SET_USER_LIST',
  setShowAll        : 'SET_SHOW_ALL',

  setPwaPrompt : 'SET_PWA_PROMPT',
};

const $actions = {
  registerUser : 'REGISTER_USER',
  loginUser    : 'LOGIN_USER',
  login        : 'LOGIN',
  logout       : 'LOGOUT',

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
  [$states.newVersion]  : null,
  [$states.alerts]      : {},
  [$states.featureFlags]: {},

  [$states.channelsViewers] : [],
  [$states.userlist]        : [],
  [$states.showAll]         : true,

  [$states.pwaPrompt]       : null,
});


// Getters
export const getters = {
  [$getters.isAuth] : state => {
    return !!state[$states.auth];
  },

  [$getters.isStreamer] : state => {
    return state[$states.user]
      && state[$states.user]
        .hasOwnProperty( 'streamkey' );
  },

  [$getters.isPremium] : state => {
    const hasRank = state[$states.user]
      && state[$states.user]
        .hasOwnProperty( 'rank' );
    if ( !hasRank ) return false;
    return state[$states.user].rank.toLowerCase() === 'premium';
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
      ? state[$states.user]
        .hasOwnProperty( 'streamkey' )
        ? state[$states.user].streamkey
        : null
      : null;
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
      if ( !channel && state[$states.channelsViewers] ) return 0;
      try {
        const c = state[$states.channelsViewers].find( c => c.channel.toLowerCase() === channel.toLowerCase() );
        return  c && c.viewCount || 0;
      } catch ( error ) {
        console.warn( error );
        return 0;
      }
    }
  },

  [$getters.getUserList] ( state ) {
    return state[$states.userlist];
  },

  [$getters.getUserCount] ( state ) {
    return state[$states.userlist].length;
  },

  [$getters.getShowAll] ( state ) {
    return state[$states.showAll];
  },

  [$getters.isAdmin] ( state ) {
    const user = state[$states.user];
    return user
      && user.hasOwnProperty( 'role' )
      && user.role === 'admin';
  },

  [$getters.getCoins] ( state ) {
    const user = state[$states.user];
    return user
      && user.hasOwnProperty( 'coins' )
      && user.coins || 0;
  },

  [$getters.getPWaPrompt] ( state ) {
    return state[$states.pwaPrompt];
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

  [$mutations.setShowAll] ( state, data ) {
    state[$states.showAll] = data;
  },

  [$mutations.setUserList] ( state, data ) {
    state[$states.userlist] = Object
      .keys( data )
      .map( key => {
        return {
          user: key,
          data: data[key].data,
          watching: data[key].watching,
        };
      })
      .reverse();
  },

  setAvatar( state, url ) {
    state[$states.user] = {}
  },

  setChannel ( state, channel ) {
    state[$states.channel] = channel;
  },

  [$mutations.setPwaPrompt] ( state, data ) {
    state[$states.pwaPrompt] = data;
  },
};


// Actions
export const actions = {

  async nuxtServerInit ({ dispatch, commit }, { req, params, route }) {
    let authUser = null, user = null;
    const cookies = this.$cookies.getAll();
    if ( cookies ) {
      try {
        if ( cookies.auth && cookies.user ) {
          authUser = cookies.auth;
          user     = cookies.user;

          commit( $mutations.setAuth, authUser );
          commit( $mutations.setUser, user );

          logger( `[${route.path}] ${user.username} logged in via nuxtServerInit: `, params );
        } else {
          logger( `[${route.path}] User is not logged in.` );
        }
      } catch ( error ) {
        logger( `Failed to get cookies!`, error );
      }

      // cookie for global chat hydration flag
      const bwGlobal = cookies._bw_global;
      if ( bwGlobal !== undefined ) {
        commit( `${Chat.namespace}/${Chat.$mutations.setGlobalSSR}`, bwGlobal );
      }
    }

    const runParallel = [
      // Chat user hydration data
      dispatch( $actions.updateViewers ),
    ];

    // Run all our API actions in parallel
    await Promise.all( runParallel );
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

    await db
      .collection( 'users' )
      .doc( userId )
      .set({
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

    user = JSON.parse( JSON.stringify( user ) );

    if ( unsubscribeUser ) {
      console.warn( 'Already had firebase listener!' );
      unsubscribeUser();
    }

    const userdocRef = db.collection( 'users' ).doc( uid );
    unsubscribeUser = userdocRef.onSnapshot( async doc => {
      const data = doc.data();
      if ( process.env.APP_DEBUG )  logger( 'User updated', data );
      commit( $mutations.setUser, data );
      this.$cookies.set( 'user',  data );
    });

    if ( process.client ) logger( 'Logged in!', user );
  },

  async [$actions.logout] ({ dispatch, commit }) {
    logger( 'Logging Out...' );
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

      logger( 'Logged Out' );
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

  async [$actions.newVersionAvailable] ( { commit }, latestVersions ) {
    if ( !latestVersions ) {
      console.error( 'Missing latestVersions!', latestVersions );
      return;
    }

    // Explode version numbers
    const currentVersion = process.env.VERSION
      .split( '.' )
      .map( v => parseInt( v ) );

    const newestVersion  = latestVersions[ process.env.BITWAVE_ENV ]
      .split( '.' )
      .map( v => parseInt( v ) );

    const checkNewVersion = ( currentVersion, newestVersion ) => {
      if ( !currentVersion || !newestVersion ) {
        console.error( 'Version number missing!', currentVersion, newestVersion );
        return false;
      }

      if ( currentVersion[0 ] <  newestVersion[0] )
        return true;
      if ( currentVersion[1]  <  newestVersion[1]
        && currentVersion[0] === newestVersion[0] )
        return true;
      if ( currentVersion[2]  <  newestVersion[2]
        && currentVersion[1] === newestVersion[1]
        && currentVersion[0] === newestVersion[0] )
        return true;
      return false
    };

    // accurately compare version numbers
    const newVersion = checkNewVersion( currentVersion, newestVersion );

    if ( newVersion ) {
      console.log( `An update is available! current: [${currentVersion}] latest: [${newestVersion}]` );
      commit( $mutations.setNewVersion, newVersion );
      this.$toast.global.update( { message: `[ v${latestVersions[ process.env.BITWAVE_ENV ]} ] A new bitwave version is available` } );
    } else {
      this.$toast.clear();
    }
  },

  async [$actions.updateAlerts] ( { commit }, alerts ) {
    logger( 'Alerts updated!', alerts );
    commit( $mutations.setAlerts, alerts );
  },

  async [$actions.updateFeatureFlags] ( { commit }, featureFlags ) {
    logger( 'Feature Flags updated!', featureFlags );
    commit( $mutations.setFeatureFlags, featureFlags );
  },

  async [$actions.updateViewers] ( { commit } ) {
    const updateChannelViewers = async () => {
      try {
        const { data } = await this.$axios.get( 'https://api.bitwave.tv/v1/chat/channels', { progress: false } );
        if ( data && data.success ) {
          commit( $mutations.setChannelViewers,  data.data );
        }
      } catch ( error ) {
        console.error( `Failed to hydrate channels`, error.message );
      }
    };

    const updateUserList = async () => {
      try {
        const { data } = await this.$axios.get( 'https://api.bitwave.tv/v1/chat/users', { progress: false } );
        if ( data && data.success ) {
          commit( $mutations.setUserList, data.data );
        }
      } catch ( error ) {
        console.error( `Failed to hydrate userlist.`, error.message );
      }
    };

    await Promise.all([
      updateChannelViewers(),
      updateUserList(),
    ]);
  }

};


// Export Store Structure
export const VStore = {
  $states,
  $getters,
  $mutations,
  $actions,
};
