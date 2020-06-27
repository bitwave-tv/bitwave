// Define Store states, getters, mutations & actions

import jwt_decode from 'jwt-decode';
import * as utils from '@/plugins/store-utils.js';
const saveToLocalStorage = values => utils.saveToLocalStorage( 'chat', values );
const loadFromLocalStorage = ( commit, props ) => utils.loadFromLocalStorage( 'chat', commit, props );
const logger = ( message, data ) => utils.logger( 'CHAT STORE', message, data );

let loggingOut = false;

const $states = {
  room            : 'ROOM',
  global          : 'GLOBAL',
  timestamps      : 'TIMESTAMPS',
  useTts          : 'USE_TTS',
  useIgnore       : 'USE_IGNORE',
  trollTts        : 'TROLL_TTS',
  ttsRate         : 'TTS_RATE',
  ttsReadUsername : 'TTS_READ_USERNAME',
  ttsTimeout      : 'TTS_TIMEOUT',
  ttsVolume       : 'TTS_VOLUME',
  ttsVoice        : 'TTS_VOICE',
  notify          : 'NOTIFY',
  autocomplete    : 'AUTOCOMPLETE',
  highDensity     : 'HIGH_DENSITY',

  ignoreList          : 'IGNORE_LIST',
  ignoreChannelList   : 'CHANNEL_IGNORE_LIST',

  receiveMentionsInLocal : 'RECIEVE_MENTIONS_IN_LOCAL',

  message    : 'MESSAGE',
  messageBuffer : 'MESSAGE_BUFFER',
  messageBufferLimit : 'MESSAGE_BUFFER_LIMIT',

  viewerList       : 'VIEWER_LIST',
  roomViewerList   : 'ROOM_VIEWER_LIST',
  streamViewerList : 'STREAM_VIEWER_LIST',

  trackMetrics        : 'TRACK_METRICS',
  trackMetricsPerUser : 'TRACK_METRICS_PER_USER',

  emoteMap : 'EMOTE_MAP',

  chatToken : 'CHAT_TOKEN',
  displayName : 'DISPLAY_NAME',
  displayChat : 'DISPLAY_CHAT',
  chatWindow  : 'CHAT_WINDOW',

  pinnedMessage : 'PINNED_MESSAGE',

  showBadge : 'SHOW_BADGE',
};

const $getters = {
  getStreamViewerList : 'GET_STREAM_VIEWERLIST',
  getRoom : 'GET_ROOM',
};

const $mutations = {
  setRoom            : 'SET_ROOM',
  setGlobal          : 'SET_GLOBAL',
  setGlobalSSR       : 'SET_GLOBAL_SSR',
  setTimestamps      : 'SET_TIMESTAMPS',
  setUseTts          : 'SET_USE_TTS',
  setUseIgnore       : 'SET_USE_IGNORE',
  setTrollTts        : 'SET_TROLL_TTS',
  setTtsRate         : 'SET_TTS_RATE',
  setTtsReadUsername : 'SET_TTS_READ_USERNAME',
  setTtsTimeout      : 'SET_TTS_TIMEOUT',
  setTtsVolume       : 'SET_TTS_VOLUME',
  setTtsVoice        : 'SET_TTS_VOICE',
  setNotify          : 'SET_NOTIFY',

  setIgnoreList      : 'SET_IGNORE_LIST',
  addIgnoreList      : 'ADD_IGNORE_LIST',
  removeIgnoreList   : 'REMOVE_IGNORE_LIST',

  setIgnoreChannelList      : 'SET_CHANNEL_IGNORE_LIST',
  addIgnoreChannelList      : 'ADD_CHANNEL_IGNORE_LIST',
  removeIgnoreChannelList   : 'REMOVE_CHANNEL_IGNORE_LIST',

  setAutocomplete    : 'SET_AUTOCOMPLETE',
  setHighDensity     : 'SET_HIGH_DENSITY',

  setReceiveMentionsInLocal : 'SET_RECIEVE_MENTIONS_IN_LOCAL',

  setMessage    : 'SET_MESSAGE',
  appendMessage : 'APPEND_MESSAGE',

  setMessageBufferLimit : 'SET_MESSAGE_BUFFER_LIMIT',
  setMessageBuffer : 'SET_MESSAGE_BUFFER',
  addToMessageBuffer : 'ADD_MESSAGE_BUFFER',

  setViewerList       : 'SET_VIEWERLIST',
  setRoomViewerList   : 'SET_ROOM_VIEWERLIST',
  setStreamViewerList : 'SET_STREAM_VIEWERLIST',

  setTrackMetrics        : 'SET_TRACK_METRICS',
  setTrackMetricsPerUser : 'SET_TRACK_METRICS_PER_USER',

  setEmoteMap    : 'SET_EMOTE_MAP',
  setEmoteMapKey : 'SET_EMOTE_MAP_KEY',

  setChatToken : 'SET_CHAT_TOKEN',
  setDisplayName : 'SET_DISPLAY_NAME',
  setDisplayChat : 'SET_DISPLAY_CHAT',
  setChatWindow  : 'SET_CHAT_WINDOW',

  setPinnedMessage : 'SET_PINNED_MESSAGE',

  setShowBadge : 'SET_SHOW_BADGE',
};

const $actions = {
  updateViewerList : 'UPDATE_VIEWERLIST',
  updateEmoteMap   : 'UPDATE_EMOTE_MAP',
  updateChatToken  : 'UPDATE_CHAT_TOKEN',

  createTrollToken : 'CREATE_TROLL_TOKEN',
  exchangeIdTokenChatToken : 'exchangeIdTokenChatToken',

  init   : 'INIT_CHAT',
  logout : 'LOGOUT',

  loadSettings : 'LOAD_SETTINGS',
};


// Create Store State
export const state = () => ({
  [$states.room]            : '',
  [$states.global]          : false,
  [$states.timestamps]      : true,
  [$states.useTts]          : false,
  [$states.useIgnore]       : true,
  [$states.trollTts]        : true,
  [$states.ttsRate]         : 10,
  [$states.ttsReadUsername] : false,
  [$states.ttsTimeout]      : 0,
  [$states.ttsVolume]       : 10,
  [$states.ttsVoice]        : 1,
  [$states.notify]          : true,
  [$states.autocomplete]    : true,
  [$states.highDensity]     : false,

  [$states.ignoreList]          : [],
  [$states.ignoreChannelList]   : [],

  [$states.receiveMentionsInLocal] : false,

  [$states.message]            : '',
  [$states.messageBufferLimit] : 10,
  [$states.messageBuffer]      : [],

  [$states.trackMetrics]        : false,
  [$states.trackMetricsPerUser] : false,

  [$states.emoteMap] : new Map(),

  [$states.chatToken] : null,
  [$states.displayName] : '',
  [$states.displayChat] : true,
  [$states.chatWindow]  : null,

  [$states.pinnedMessage] : null,

  [$states.showBadge] : true,
});


// Create Store Getters
export const getters = {
  // Get stream viewer list
  [$getters.getStreamViewerList] ( state ) {
    return state[$states.streamViewerList];
  },
};


// Create Store Mutations
export const mutations = {
  // Set room
  [$mutations.setRoom] ( state, data ) {
    state[$states.room] = data;
  },

  // Set show timestamps
  [$mutations.setTimestamps] ( state, data ) {
    state[$states.timestamps] = JSON.parse( data );
    saveToLocalStorage( { [$states.timestamps]: data } );
  },

  // Set global chat
  [$mutations.setGlobal] ( state, data ) {
    state[$states.global] = JSON.parse( data );
    this.$cookies.set( '_bw_global', data );
    saveToLocalStorage( { [$states.global]: data } );
  },

  // Set global chat SSR
  [$mutations.setGlobalSSR] ( state, data ) {
    state[$states.global] = JSON.parse( data );
  },

  // Set use TTS
  [$mutations.setUseTts] ( state, data ) {
    state[$states.useTts] = JSON.parse( data );
    saveToLocalStorage( { [$states.useTts]: data } );
    try {
      if ( !data ) speechSynthesis.cancel();
    } catch ( error ) {
      console.warn( `cannot access 'speechSynthesis'` );
    }
  },

  // Set use ignore
  [$mutations.setUseIgnore] ( state, data ) {
    state[$states.useIgnore] = JSON.parse( data );
    saveToLocalStorage( { [$states.useIgnore]: data } );
  },

  // Set user ignore list
  [$mutations.setIgnoreList] ( state, data ) {
    state[$states.ignoreList] = data;
    saveToLocalStorage( { [$states.ignoreList]: data } );
  },

  // Add user to ignore list
  [$mutations.addIgnoreList] ( state, data ) {
    state[$states.ignoreList].push( data );
    saveToLocalStorage( { [$states.ignoreList]: state[$states.ignoreList] } );
  },

  // Filter user from ignore list
  [$mutations.removeIgnoreList] ( state, data ) {
    state[$states.ignoreList] = state[$states.ignoreList].filter( x => x !== data );
    saveToLocalStorage( { [$states.ignoreList]: state[$states.ignoreList] } );
  },

  // Set channel ignore list
  [$mutations.setIgnoreChannelList] ( state, data ) {
    state[$states.ignoreChannelList] = data;
    saveToLocalStorage( { [$states.ignoreChannelList]: data } );
  },

  // Add channel to ignore list
  [$mutations.addIgnoreChannelList] ( state, data ) {
    state[$states.ignoreChannelList].push( data );
    saveToLocalStorage( { [$states.ignoreChannelList]: state[$states.ignoreChannelList] } );
  },

  // Filter channel from ignore list
  [$mutations.removeIgnoreChannelList] ( state, data ) {
    state[$states.ignoreChannelList] = state[$states.ignoreChannelList].filter( x => x !== data );
    saveToLocalStorage( { [$states.ignoreChannelList]: state[$states.ignoreChannelList] } );
  },

  // Set TTS enabled for trolls
  [$mutations.setTrollTts] ( state, data ) {
    state[$states.trollTts] = data;
    saveToLocalStorage( { [$states.trollTts]: data } );
  },

  // Set TTS Rate
  [$mutations.setTtsRate] ( state, data ) {
    if ( !data ) return;
    state[$states.ttsRate] = JSON.parse( data );
    saveToLocalStorage( { [$states.ttsRate]: data } );
  },

  // Set if TTS reads username
  [$mutations.setTtsReadUsername] ( state, data ) {
    state[$states.ttsReadUsername] = JSON.parse( data );
    saveToLocalStorage( { [$states.ttsReadUsername]: data } );
  },

  // Set TTS Timeout
  [$mutations.setTtsTimeout] ( state, data ) {
    if ( !data ) return;
    state[$states.ttsTimeout] = JSON.parse( data );
    saveToLocalStorage( { [$states.ttsTimeout]: data } );
  },

  // Set TTS Volume
  [$mutations.setTtsVolume] ( state, data ) {
    if ( !data ) return;
    state[$states.ttsVolume] = JSON.parse( data );
    saveToLocalStorage( { [$states.ttsVolume]: data } );
  },

  // Set TTS voice Id (index)
  [$mutations.setTtsVoice] ( state, data ) {
    state[$states.ttsVoice] = data;
  },

  // Set notification sounds
  [$mutations.setNotify] ( state, data ) {
    state[$states.notify] = JSON.parse( data );
    saveToLocalStorage( { [$states.notify]: data } );
  },

  // Set autocomplete
  [$mutations.setAutocomplete] ( state, data ) {
    state[$states.autocomplete] = JSON.parse( data );
    saveToLocalStorage( { [$states.autocomplete]: data } );
  },

  // Set high density
  [$mutations.setHighDensity] ( state, data ) {
    state[$states.highDensity] = JSON.parse( data );
    saveToLocalStorage( { [$states.highDensity]: data } );
  },

  // Set receive mentions in local
  [$mutations.setReceiveMentionsInLocal] ( state, data ) {
    state[$states.receiveMentionsInLocal] = data;
    saveToLocalStorage( { [$states.receiveMentionsInLocal]: data } );
  },

  // Set current input message
  [$mutations.setMessage] ( state, data ) {
    if ( data === null ) state[$states.message] = '';
    else state[$states.message] = data;
    saveToLocalStorage( { [$states.message]: state[$states.message] } );
  },

  // Append to current input message
  [$mutations.appendMessage] ( state, data ) {
    state[$states.message] += data;
    saveToLocalStorage( { [$states.message]: state[$states.message] } );
  },

  // Sets message buffer (history) max size
  [$mutations.setMessageBufferLimit] ( state, data ) {
    state[$states.messageBufferLimit] = data;
    saveToLocalStorage( { [$states.messageBufferLimit]: data } );
  },

  // Sets message buffer
  [$mutations.setMessageBuffer] (state, data ) {
    state[$states.messageBuffer] = data;
    state[$states.messageBuffer] = state[$states.messageBuffer].slice( 0, state[$states.messageBufferLimit] );
  },

  // Add a message  to message buffer (history)
  [$mutations.addToMessageBuffer] ( state, data ) {
    const bufferSize = state[$states.messageBuffer].length;
    if ( bufferSize === 0 ) state[$states.messageBuffer].unshift( data );
    if ( bufferSize > 0 && state[$states.messageBuffer][bufferSize - 1] !== data ) {
      state[$states.messageBuffer].unshift( data );
      state[$states.messageBuffer] = state[$states.messageBuffer].slice( 0, state[$states.messageBufferLimit] );
    }
    saveToLocalStorage( { [$states.messageBuffer]: state[$states.messageBuffer] } );
  },

  [$mutations.setTrackMetrics] ( state, data ) {
    state[$states.trackMetrics] = data;
  },

  [$mutations.setTrackMetricsPerUser] ( state, data ) {
    state[$states.trackMetricsPerUser] = data;
  },

  [$mutations.setEmoteMap] ( state, data ) {
    // data is an array of emotes: {label: string, ...}
    for( const emote of data ) {
      state[$states.emoteMap].set( emote.label, emote );
    }
  },

  [$mutations.setEmoteMapKey] ( state, data ) {
    state[$states.emoteMap].set( data.key, data.value );
  },

  // Set chat token
  [$mutations.setChatToken] ( state, data ) {
    state[$states.chatToken] = data;
  },

  // Set chat token
  [$mutations.setDisplayName] ( state, data ) {
    state[$states.displayName] = data;
  },

  // Controls chat visibility
  [$mutations.setDisplayChat] ( state, data ) {
    state[$states.displayChat] = data;
  },

  // Chat popout window
  [$mutations.setChatWindow] ( state, data ) {
    state[$states.chatWindow] = data;
  },

  // Pinned message
  [$mutations.setPinnedMessage] ( state, data ) {
    state[$states.pinnedMessage] = data;
  },

  // Whether or not to show user badge
  [$mutations.setShowBadge] ( state, data ) {
    state[$states.showBadge] = JSON.parse( data );
    saveToLocalStorage( { [$states.showBadge]: data } );
  },
};


// Create Store Actions
export const actions = {
  CONNECT ( { dispatch, commit, state }, data ) {
    commit( 'SET_ROOM', data );
  },

  async [$actions.updateEmoteMap] ( { state, commit } ) {
    // Detect if we have already leaded emotes
    if ( state[$states.emoteMap] && state[$states.emoteMap].size > 0 ) return;

    // Load emote autocompletes
    try {
      const { data } = await this.$axios.get( 'https://api.bitwave.tv/v1/emotes', { progress: false } );
      commit( $mutations.setEmoteMap,  data.data );
    } catch ( error ) {
      console.error( `Failed to load emote map!` );
      console.error( error.message );
    }
  },

  async [$actions.updateChatToken] ( { commit }, data ) {
    try {
      commit( $mutations.setChatToken, data );
      const { user } = jwt_decode( data );
      commit( $mutations.setDisplayName, user.name );
    } catch ( error ) {
      console.error( `Failed to update chat token.` );
      console.error( error.message );
    }
  },


  async [$actions.exchangeIdTokenChatToken] ({ dispatch }, idToken) {
    try {
      const { data } = await this.$axios.post( `https://api.bitwave.tv/api/token`, { token: idToken } );
      await dispatch( $actions.updateChatToken, data.chatToken );
      try {
        localStorage.setItem( 'chatToken', data.chatToken );
      } catch ( error ) {
        console.warn( `Failed to save 'chatToken' to localStorage`, error );
      }
      if ( process.env.APP_DEBUG ) logger ( 'Set Chat Token' );
    } catch ( error ) {
      console.error( `%cCHAT STORE:%c ${error.message}: Failed to exchange token!\n%o`, 'background: red; color: #fff; border-radius: 3px; padding: .25rem;', '', error );
    }
  },


  async [$actions.createTrollToken] ({ dispatch }) {
    const { data } = await this.$axios.get( 'https://api.bitwave.tv/api/troll-token' );
    await dispatch( $actions.updateChatToken, data.chatToken );
    try {
      localStorage.setItem( 'troll', data.chatToken );
    } catch ( error ) {
      console.warn( `Failed to save 'troll' (token) to localStorage`, error );
    }
  },


  async [$actions.init] ({ dispatch }) {
    // Find existing tokens in localStorage
    const findChatToken = () => {
      let token = null;
      try {
        // Check for user token
        token = localStorage.getItem( 'chatToken' );
        if ( token ) return token;
        // Check for troll token
        token = localStorage.getItem( 'troll' );
        if ( token ) return token;
      } catch ( error ) {
        console.log( `no existing tokens found` );
      }
      return false;
    };

    // Check for existing tokens
    const token = findChatToken();
    if ( token ) {
      // Use existing token
      await dispatch( $actions.updateChatToken, token );
    } else {
      // No existing tokens, get new troll token
      await dispatch( $actions.createTrollToken );
    }
  },

  async [$actions.logout] ({ dispatch }) {
    // Prevent edge case where logout is called from multiple locations
    if ( loggingOut ) {
      if ( process.env.APP_DEBUG ) logger ( `Logout is already in progress.` );
      return;
    }

    loggingOut = true; // Lock action while processing

    // Remove user chat token
    try {
      localStorage.removeItem( 'chatToken' );
    } catch ( error ) {
      console.warn( `Failed to remove 'chatToken'`, error );
    }

    // Check for existing troll token
    let trollToken = null;
    try {
      trollToken = localStorage.getItem( 'troll' );
    } catch ( error ) {
      console.warn( `Failed to get 'troll' (token)`, error );
    }

    if ( !trollToken ) {
      // Create new troll token if for some reason we don't have one
      await dispatch( $actions.createTrollToken );
    } else {
      // Use existing troll token if available
      await dispatch( $actions.updateChatToken, trollToken );
    }

    loggingOut = false; // Unlock when completed
  },

  [$actions.loadSettings] ({ commit }) {
    let settings = new Map([
      [$states.timestamps, $mutations.setTimestamps],
      [$states.global, $mutations.setGlobal],
      [$states.useTts, $mutations.setUseTts],
      [$states.useIgnore, $mutations.setUseIgnore],
      [$states.ignoreList, $mutations.setIgnoreList],
      [$states.ignoreChannelList, $mutations.setIgnoreChannelList],
      [$states.notify, $mutations.setNotify],
      [$states.autocomplete, $mutations.setAutocomplete],
      [$states.highDensity, $mutations.setHighDensity],
      [$states.receiveMentionsInLocal, $mutations.setReceiveMentionsInLocal],
      [$states.showBadge, $mutations.setShowBadge],
      [$states.messageBufferLimit, $mutations.setMessageBufferLimit],
      [$states.messageBuffer, $mutations.setMessageBuffer],
      [$states.trollTts, $mutations.setTrollTts],
      [$states.ttsRate, $mutations.setTtsRate],
      [$states.ttsReadUsername, $mutations.setTtsReadUsername],
      [$states.ttsTimeout, $mutations.setTtsTimeout],
      [$states.ttsVolume, $mutations.setTtsVolume],
      [$states.message, $mutations.setMessage],
    ]);

    let oldSettings = new Map([
      ['showtimestamps', $states.timestamps],
      ['globalchat', $states.global],
      ['tts', $states.useTts],
      ['useignore', $states.useIgnore],
      ['ignorelist', $states.ignoreList],
      ['ignoreChannellist', $states.ignoreChannelList],
      ['notify', $states.notify],
      ['autocomplete', $states.autocomplete],
      ['high-density', $states.highDensity],
      ['at-in-local', $states.receiveMentionsInLocal],
      ['showbadge', $states.showBadge],
    ]);

    oldSettings.forEach(
      ( newKey, oldKey ) => utils.migrate(
        oldKey,
        value => saveToLocalStorage( { [newKey]: value } )
      )
    );

    loadFromLocalStorage( commit, settings );
  },
};


// Export Store Structure
export const Chat = {
  namespace : 'chat',
  $states,
  $getters,
  $mutations,
  $actions,
};
