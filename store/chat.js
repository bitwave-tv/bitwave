// Define Store states, getters, mutations & actions

const $states = {
  room       : 'ROOM',
  global     : 'GLOBAL',
  timestamps : 'TIMESTAMPS',
  useTts     : 'USE_TTS',
  useIgnore  : 'USE_IGNORE',
  trollTts   : 'TROLL_TTS',
  ttsRate    : 'TTS_RATE',
  ttsVoice   : 'TTS_VOICE',
  notify     : 'NOTIFY',
  ignoreList : 'IGNORE_LIST',

  message    : 'MESSAGE',

  viewerList       : 'VIEWER_LIST',
  roomViewerList   : 'ROOM_VIEWER_LIST',
  streamViewerList : 'STREAM_VIEWER_LIST',
};

const $getters = {
  viewerCount         : 'VIEWER_COUNT',
  getStreamViewerList : 'GET_STREAM_VIEWERLIST',
};

const $mutations = {
  setRoom       : 'SET_ROOM',
  setGlobal     : 'SET_GLOBAL',
  setTimestamps : 'SET_TIMESTAMPS',
  setUseTts     : 'SET_USE_TTS',
  setUseIgnore  : 'SET_USE_IGNORE',
  setTrollTts   : 'SET_TROLL_TTS',
  setTtsRate    : 'SET_TTS_RATE',
  setTtsVoice   : 'SET_TTS_VOICE',
  setNotify     : 'SET_NOTIFY',
  setIgnoreList : 'SET_IGNORE_LIST',

  setMessage    : 'SET_MESSAGE',
  appendMessage : 'APPEND_MESSAGE',

  setViewerList       : 'SET_VIEWERLIST',
  setRoomViewerList   : 'SET_ROOM_VIEWERLIST',
  setStreamViewerList : 'SET_STREAM_VIEWERLIST',
};

const $actions = {
  updateViewerList : 'UPDATE_VIEWERLIST',
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
  [$states.ttsVoice]   : 1,
  [$states.notify]     : false,
  [$states.ignoreList] : [],

  [$states.message]: '',

  [$states.viewerList]       : [],
  [$states.roomViewerList]   : {},
  [$states.streamViewerList] : [],
});


// Create Store Getters
export const getters = {
  // Get total viewer count
  [$getters.viewerCount] ( state ) {
    return state[$states.viewerList].length;
  },

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

  // Set TTS voice Id (index)
  [$mutations.setTtsVoice] ( state, data ) {
    state[$states.ttsVoice] = data;
  },

  // Set notification sounds
  [$mutations.setNotify] ( state, data ) {
    state[$states.notify] = JSON.parse( data );
    localStorage.setItem( 'notify', data );
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

  [$mutations.setRoomViewerList] ( state, data ) {
    state[$states.roomViewerList] = { ...data };
  },

  [$mutations.setViewerList] ( state, data ) {
    state[$states.viewerList] = [ ...data ];
  },

  [$mutations.setStreamViewerList] ( state, data ) {
    state[$states.streamViewerList] = data;
  },
};


// Create Store Actions
export const actions = {
  CONNECT ( { dispatch, commit, state }, data ) {
    commit( 'SET_ROOM', data );
  },

  [$actions.updateViewerList] ( { dispatch, commit, state }, data ) {

    // Create list of unique viewers in each channel
    const roomViewerList = data.reduce( ( accumulator, user ) => {
      let username = user.username;
      let channel  = user.page ? user.page.watch || user.page : 'global' ;

      if ( !channel ) return accumulator;
      if ( typeof( channel ) === 'string' ) channel = channel.toLowerCase();

      if ( username ) username = username.toLowerCase();

      if ( channel in accumulator ) {
        if ( username in accumulator[channel] ) {
          accumulator[channel].viewers[username].push( user );
        } else {
          accumulator[channel].viewers[username] = [ user ];
          accumulator[channel].total++;
        }
      } else {
        accumulator[channel] = {
          viewers: {},
          total: 1,
        };
        accumulator[channel].viewers[username] = [ user ];
        accumulator[channel].total = 1;
      }
      return accumulator;
    }, {} );
    commit( $mutations.setRoomViewerList, roomViewerList );


    // Create unique list of users globally
    const key = 'username';
    const viewerList = data.reduce( ( accumulator, current ) => {
      if ( !accumulator.find( obj => obj[key] === current[key] ) ) accumulator.push( current );
      return accumulator;
    }, [] );
    commit( $mutations.setViewerList, viewerList );

    // Create list of viewers in each stream
    const streamViewers = Object.entries( roomViewerList ).map( streamer => {
      const streamViewers = Object.entries( streamer[1].viewers );
      return {
        streamer: streamer[0],
        viewCount: streamViewers.length,
        streamViewers,
      }
    });
    commit( $mutations.setStreamViewerList, streamViewers );
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
