import { auth, db } from '@/plugins/firebase.js';
import { Chat } from '@/store/chat';
import { parseCookiesForAuth } from "~/assets/js/Cookies/parse";

import * as utils from '@/plugins/store-utils.js';
import { throttle } from '@/assets/js/throttle';
const logger = ( message, data ) => utils.logger( 'STORE', message, data );
const saveToLocalStorage = values => utils.saveToLocalStorage( 'store', values );
const loadFromLocalStorage = ( commit, props ) => utils.loadFromLocalStorage( 'store', commit, props );

let unsubscribeUser = null;
let throttledUpdateViewers = null;

// Define Store
const $states = {
  auth : 'AUTH',
  user : 'USER',

  blurNsfw  : 'BLUR_NSFW',

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
  getAvatar    : 'GET_AVATAR',
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

  setBlurNsfw  : 'SET_BLUR_NSFW',

  setNewVersion : 'SET_LATEST_VERSION',

  setAlerts: 'SET_SYSTEM_ALERT',
  setFeatureFlags : 'SET_FEATURE_FLAGS',

  setChannelViewers : 'SET_CHANNEL_VIEWERS',
  setUserList       : 'SET_USER_LIST',
  setShowAll        : 'SET_SHOW_ALL',

  setPwaPrompt : 'SET_PWA_PROMPT',
};

const $actions = {
  loginUser    : 'LOGIN_USER',
  login        : 'LOGIN',
  logout       : 'LOGOUT',

  newVersionAvailable : 'NEW_VERSION_AVAILABLE',

  updateAlerts : 'CHECK_FOR_ALERTS',
  updateFeatureFlags : 'UPDATE_FEATURE_FLAGS',

  updateViewers : 'UPDATE_VIEWERS',

  loadSettings : 'LOAD_SETTINGS',
};


// Create Store
export const state = () => ({
  [$states.auth]            : null,
  [$states.user]            : null,
  [$states.channel]         : null,
  [$states.newVersion]      : null,
  [$states.alerts]          : {},
  [$states.featureFlags]    : {},

  [$states.blurNsfw]        : true,

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

  [$getters.getAuth] : state => {
    return state[$states.auth];
  },

  [$getters.getUID] : state => {
    return state[$states.auth]
      ? state[$states.auth].uid
      : null;
  },

  [$getters.getAvatar] : state => {
    return state[$states.auth]
      ? state[$states.auth].avatar
      : null;
  },

  [$getters.getUsername] : state => {
    return state[$states.auth]
      ? state[$states.auth].username
      : null;
  },

  [$getters.getUser] : state => {
    return state[$states.user];
  },

  [$getters.isPremium] : state => {
    const hasRank = state[$states.user]
      && state[$states.user]
        .hasOwnProperty( 'rank' );
    if ( !hasRank ) return false;
    return state[$states.user].rank.toLowerCase() === 'premium';
  },

  /*[$getters.getUsername] : state => {
    if ( state[$states.user] ) return state[$states.user].username || null;
    else return null;
  },*/

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
    state[$states.auth] = auth;
  },

  [$mutations.setUser] ( state, user ) {
    state[$states.user] = user;
  },

  [$mutations.setBlurNsfw] ( state, data ) {
    state[$states.blurNsfw] = data;
    saveToLocalStorage( { [$states.blurNsfw]: data } );
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

  [$mutations.setPwaPrompt] ( state, data ) {
    state[$states.pwaPrompt] = data;
  },
};


// Actions
export const actions = {

  async nuxtServerInit ({ dispatch, commit }, { req, params, route }) {
    const cookies = this.$cookies.getAll();
    try {
      const authUser = parseCookiesForAuth( cookies );
      if ( authUser ) {
        // commit( $mutations.setAuth, authUser );
        logger( `[${route.path}] ${authUser.username} logged in via nuxtServerInit: `, params );
      } else {
        logger( `[${route.path}] User is not logged in.` );
      }
    } catch ( error ) {
      logger( `Failed to get cookies!`, error );
    }

    // cookie for global chat hydration flag
    const bwGlobal = cookies?._bw_global ?? undefined;
    if ( bwGlobal !== undefined ) {
      commit( `${Chat.namespace}/${Chat.$mutations.setGlobalSSR}`, bwGlobal );
    }

    const runParallel = [
      // Chat user hydration data
      dispatch( $actions.updateViewers ),
    ];

    // Run all our API actions in parallel
    await Promise.all( runParallel );
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

    if ( unsubscribeUser ) {
      console.warn( 'Already had firebase listener!' );
      unsubscribeUser();
    }

    const userdocRef = db
      .collection( 'users' )
      .doc( uid );

    unsubscribeUser = userdocRef.onSnapshot( async doc => {
      // Get user data from database
      const data = doc.data();

      // Newly created users trigger a snapshot to occur,
      // But there will be missing data until the API server has completed
      // generating the user document with default value, so return early.
      if ( !data ) return;

      // Log user data to console to assist in debugging
      if ( process.env.APP_DEBUG )  logger( 'User updated', data );

      // Store a full copy of the user's profile in the store
      commit( $mutations.setUser, data );

      // TODO: Cleanup, removes old user cookie
      // this.$cookies.set( 'user',  data );
      this.$cookies.remove( 'user' );

      const auth = {
        accessToken: token,
        uid: uid,
        username: data.username,
        avatar: data.avatar,
      };

      commit( $mutations.setAuth, auth );
      this.$cookies.set( 'auth',  auth );

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
    if ( !throttledUpdateViewers ) {
      // How long (in seconds) to wait between subsequent API requests
      const throttleDelay = 15;

      // Combines update methods
      const update = async () => {
        const updateChannelViewers = async () => {
          try {
            const { data } = await this.$axios.get( 'https://api.bitwave.tv/v1/chat/channels', { progress: false, skipAuth: true } );
            if ( data && data.success ) {
              commit( $mutations.setChannelViewers,  data.data );
            }
          } catch ( error ) {
            console.error( `Failed to hydrate channels`, error.message );
          }
        };

        const updateUserList = async () => {
          try {
            const { data } = await this.$axios.get( 'https://api.bitwave.tv/v1/chat/users', { progress: false, skipAuth: true } );
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
      throttledUpdateViewers = throttle( update, throttleDelay * 1000 );
      return;
    }
    const throttled = throttledUpdateViewers();
    // logger( `Throttled $actions.updateViewers`, throttled );
    console.debug( `Throttled $actions.updateViewers`, throttled );
  },

  async [$actions.loadSettings] ( { commit } ) {
    let settings = new Map([
      [$states.blurNsfw, $mutations.setBlurNsfw],
    ]);

    loadFromLocalStorage( commit, settings );
  },
};


// Export Store Structure
export const VStore = {
  $states,
  $getters,
  $mutations,
  $actions,
};
