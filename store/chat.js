// Define Store states, getters, mutations & actions

import jwt_decode from 'jwt-decode';

let loggingOut = false;

const $states = {
  room       : 'ROOM',
  global     : 'GLOBAL',
  timestamps : 'TIMESTAMPS',
  useTts     : 'USE_TTS',
  useIgnore  : 'USE_IGNORE',
  trollTts   : 'TROLL_TTS',
  ttsRate    : 'TTS_RATE',
  ttsVolume  : 'TTS_VOLUME',
  ttsVoice   : 'TTS_VOICE',
  notify     : 'NOTIFY',
  ignoreList : 'IGNORE_LIST',
  autocomplete : 'AUTOCOMPLETE',

  message    : 'MESSAGE',
  messageBuffer : 'MESSAGE_BUFFER',

  viewerList       : 'VIEWER_LIST',
  roomViewerList   : 'ROOM_VIEWER_LIST',
  streamViewerList : 'STREAM_VIEWER_LIST',

  emoteList : 'EMOTE_LIST',

  chatToken : 'CHAT_TOKEN',
  displayName : 'DISPLAY_NAME',
};

const $getters = {
  getStreamViewerList : 'GET_STREAM_VIEWERLIST',
};

const $mutations = {
  setRoom       : 'SET_ROOM',
  setGlobal     : 'SET_GLOBAL',
  setGlobalSSR  : 'SET_GLOBAL_SSR',
  setTimestamps : 'SET_TIMESTAMPS',
  setUseTts     : 'SET_USE_TTS',
  setUseIgnore  : 'SET_USE_IGNORE',
  setTrollTts   : 'SET_TROLL_TTS',
  setTtsRate    : 'SET_TTS_RATE',
  setTtsVolume  : 'SET_TTS_VOLUME',
  setTtsVoice   : 'SET_TTS_VOICE',
  setNotify     : 'SET_NOTIFY',
  setIgnoreList : 'SET_IGNORE_LIST',
  setAutocomplete : 'SET_AUTOCOMPLETE',

  setMessage    : 'SET_MESSAGE',
  appendMessage : 'APPEND_MESSAGE',

  addToMessageBuffer : 'ADD_MESSAGE_BUFFER',

  setViewerList       : 'SET_VIEWERLIST',
  setRoomViewerList   : 'SET_ROOM_VIEWERLIST',
  setStreamViewerList : 'SET_STREAM_VIEWERLIST',

  setEmoteList : 'SET_EMOTE_LIST',

  setChatToken : 'SET_CHAT_TOKEN',
  setDisplayName : 'SET_DISPLAY_NAME',
};

const $actions = {
  updateViewerList : 'UPDATE_VIEWERLIST',
  updateEmoteList  : 'UPDATE_EMOTE_LIST',
  updateChatToken  : 'UPDATE_CHAT_TOKEN',

  createTrollToken : 'CREATE_TROLL_TOKEN',
  exchangeIdTokenChatToken : 'exchangeIdTokenChatToken',

  init   : 'INIT_CHAT',
  logout : 'LOGOUT',

  loadSettings : 'LOAD_SETTINGS',
};


// Create Store State
export const state = () => ({
  [$states.room]       : '',
  [$states.global]     : false,
  [$states.timestamps] : true,
  [$states.useTts]     : false,
  [$states.useIgnore]  : true,
  [$states.trollTts]   : true,
  [$states.ttsRate]    : 10,
  [$states.ttsVolume]  : 10,
  [$states.ttsVoice]   : 1,
  [$states.notify]     : true,
  [$states.ignoreList] : [],
  [$states.autocomplete] : true,

  [$states.message]          : '',
  [$states.messageBuffer]    : [],

  [$states.emoteList] : [],

  [$states.chatToken] : null,
  [$states.displayName] : '',
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
    localStorage.setItem( 'showtimestamps', data );
  },

  // Set global chat
  [$mutations.setGlobal] ( state, data ) {
    state[$states.global] = JSON.parse( data );
    localStorage.setItem( 'globalchat', data );
    this.$cookies.set( '_bw_global', data );
  },

  // Set global chat SSR
  [$mutations.setGlobalSSR] ( state, data ) {
    state[$states.global] = JSON.parse( data );
  },

  // Set use TTS
  [$mutations.setUseTts] ( state, data ) {
    state[$states.useTts] = JSON.parse( data );
    localStorage.setItem( 'tts', data );
    if ( !data ) speechSynthesis.cancel();
  },

  // Set use ignore
  [$mutations.setUseIgnore] ( state, data ) {
    state[$states.useIgnore] = JSON.parse( data );
    localStorage.setItem( 'useignore', data );
  },

  // Set TTS enabled for trolls
  [$mutations.setTrollTts] ( state, data ) {
    state[$states.trollTts] = data;
  },

  // Set TTS Rate
  [$mutations.setTtsRate] ( state, data ) {
    state[$states.ttsRate] = JSON.parse( data );
  },

  // Set TTS Volume
  [$mutations.setTtsVolume] ( state, data ) {
    state[$states.ttsVolume] = JSON.parse( data );
  },

  // Set TTS voice Id (index)
  [$mutations.setTtsVoice] ( state, data ) {
    state[$states.ttsVoice] = data;
  },

  // Set notification sounds
  [$mutations.setNotify] ( state, data ) {
    state[$states.notify] = JSON.parse( data );
    localStorage.setItem( 'notify', data );
  },

  // Set autocomplete
  [$mutations.setAutocomplete] ( state, data ) {
    state[$states.autocomplete] = JSON.parse( data );
    localStorage.setItem( 'autocomplete', data );
  },

  // Set ignore list
  [$mutations.setIgnoreList] ( state, data ) {
    state[$states.ignoreList] = data;
  },

  // Set current input message
  [$mutations.setMessage] ( state, data ) {
    if ( data === null ) state[$states.message] = '';
    else state[$states.message] = data;
  },

  // Append to current input message
  [$mutations.appendMessage] ( state, data ) {
    state[$states.message] += data;
  },

  // Sets message buffer (history)
  [$mutations.addToMessageBuffer] ( state, data ) {
    const bufferSize = state[$states.messageBuffer].length;
    if ( bufferSize === 0 ) state[$states.messageBuffer].push( data );
    if ( bufferSize > 0 && state[$states.messageBuffer][bufferSize - 1] !== data ) {
      state[$states.messageBuffer].push( data );
      state[$states.messageBuffer] = state[$states.messageBuffer].splice( -10 );
    }
  },

  [$mutations.setEmoteList] ( state, data ) {
    state[$states.emoteList] = data;
  },

  // Set chat token
  [$mutations.setChatToken] ( state, data ) {
    state[$states.chatToken] = data;
  },

  // Set chat token
  [$mutations.setDisplayName] ( state, data ) {
    state[$states.displayName] = data;
  },
};


// Create Store Actions
export const actions = {
  CONNECT ( { dispatch, commit, state }, data ) {
    commit( 'SET_ROOM', data );
  },

  async [$actions.updateEmoteList] ( { commit } ) {
    try {
      const { data } = await this.$axios.get( 'https://api.bitwave.tv/v1/emotes', { progress: false } );
      commit( $mutations.setEmoteList,  data.data );
    } catch ( error ) {
      console.error( `Failed to load emote list.` );
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

      localStorage.setItem( 'chatToken', data.chatToken );

      await dispatch( $actions.updateChatToken, data.chatToken );

      if ( process.env.APP_DEBUG ) console.log( `%cCHAT STORE:%c Set Chat Token.`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '' );
    } catch ( error ) {
      console.error( `%cCHAT STORE:%c ${error.message}: Failed to exchange token!\n%o`, 'background: red; color: #fff; border-radius: 3px; padding: .25rem;', '', error );
    }
  },


  async [$actions.createTrollToken] ({ dispatch }) {
    const { data } = await this.$axios.get( 'https://api.bitwave.tv/api/troll-token' );
    localStorage.setItem( 'troll', data.chatToken );
    await dispatch( $actions.updateChatToken, data.chatToken );
  },


  async [$actions.init] ({ dispatch }) {
    // Check for user token
    const userToken = localStorage.getItem( 'chatToken' );
    if ( userToken ) {
      await dispatch( $actions.updateChatToken, userToken );
      return;
    }

    // Check for troll token
    const trollToken = localStorage.getItem( 'troll' );
    if ( trollToken ) {
      await dispatch( $actions.updateChatToken, trollToken );
      return;
    }

    // No existing tokens, get new troll token
    await dispatch( $actions.createTrollToken );
  },

  async [$actions.logout] ({ dispatch }) {
    // Prevent edge case where logout is called from multiple locations
    if ( loggingOut ) {
      if ( process.env.APP_DEBUG ) console.log( `Logout is already in progress.` );
      return;
    }

    loggingOut = true; // Lock action while processing

    // Remove user chat token
    localStorage.removeItem( 'chatToken' );

    // Check for existing troll token
    const trollToken = localStorage.getItem( 'troll' );

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
    // Global chat
    try {
      const global = localStorage.getItem( 'globalchat' );
      if ( !!global ) commit( $mutations.setGlobal, global );
    } catch ( error ) {
      console.log( 'No global chat option found.' );
    }

    // Timestamps
    try {
      const showTimestamps = localStorage.getItem( 'showtimestamps' );
      if ( !!showTimestamps ) commit( $mutations.setTimestamps, showTimestamps );
    } catch ( error ) {
      console.log( 'No showTimestamps option found.' );
    }

    // Ignore users
    try {
      const ignore = localStorage.getItem( 'useignore' );
      if ( !!ignore ) commit( $mutations.setUseIgnore, JSON.parse( ignore ) );
    } catch ( error ) {
      console.log( 'No ignore option found.' );
    }

    // Notifications
    try {
      const notify = localStorage.getItem( 'notify' );
      if ( !!notify ) commit( $mutations.setNotify, notify );
    } catch ( error ) {
      console.log ( 'No notification sound option found.' );
    }

    // Autocomplete
    try {
      const autocomplete = localStorage.getItem( 'autocomplete' );
      if ( !!autocomplete ) commit( $mutations.setAutocomplete, autocomplete );
    } catch ( error ) {
      console.log ( 'No autocomplete option found.' );
    }

    // Get ignore list
    try {
      const ignores = localStorage.getItem( 'ignorelist' );
      if ( !!ignores ) commit( $mutations.setIgnoreList, JSON.parse( ignores ) );
    } catch ( error ) {
      console.log( 'No ignore list found.' );
    }

    // TODO: Implement
    // Get ignore channel list
    /*try {
      let ignores = localStorage.getItem( 'ignoreChannelList' );
      if ( ignores ) this.ignoreChannelList = JSON.parse( ignores );
    } catch ( error ) {
      console.log( 'No ignore channel list found.' );
    }*/

    // Get ignore channel list
    /*try {
      const ignores = localStorage.getItem( 'ignoreChannelList' );
      if ( !!ignores ) commit( $mutations.setChannelIgnoreList, JSON.parse( ignores ) );
    } catch ( error ) {
      console.log( 'No ignore channel list found.' );
    }*/

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
