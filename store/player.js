// Created by xander on 1/22/2020

const saveToLocalStorage = ( values ) => {
  try {
    let existing = localStorage.getItem( 'player-settings' );
    existing = JSON.parse( existing ) || {};
    const data = JSON.stringify( { ...existing, ...values } );
    if ( data ) localStorage.setItem( 'player-settings', data );
  } catch ( error ) {
    console.error( 'Failed to save to localStorage', error );
  }
};

const $states = {
  // Player properties
  source: 'VIDEO_SRC',
  poster: 'VIDEO_POSTER',

  inPiP: 'IS_IN_PIP',

  // Player options
  keepLive: 'KEEP_LIVE',
  disableBumps: 'DISABLE_BUMPS',

  // Player state
  detach: 'DETACH',
};

const $getters = {

};

const $mutations = {
  setSource: 'SET_VIDEO_SRC',
  setPoster: 'SET_VIDEO_POSTER',

  setPiP: 'SET_PIP',

  setKeepLive: 'SET_KEEP_LIVE',
  setDisableBumps: 'SET_DISABLE_BUMPS',

  setDetach: 'SET_DETACH',
};

const $actions = {
  loadSettings: 'LOAD_SETTINGS',
};


// Create Store
export const state = () => ({
  [$states.source]: { url: '', type: '' },
  [$states.poster]: '',

  [$states.inPiP]: false,

  [$states.keepLive]: false,
  [$states.disableBumps]: false,
  [$states.detach]: false,
});

// Getters
export const getters = {
  /*[$getters.state] ( state ) {
    return [$states.state];
  },*/
};

// Mutations
export const mutations = {
  [$mutations.setSource] ( state, data ) {
    state[$states.source] = data;
  },

  [$mutations.setPoster] ( state, data ) {
    state[$states.poster] = data;
  },

  [$mutations.setPiP] ( state, data ) {
    state[$states.inPiP] = data;
  },

  [$mutations.setKeepLive] ( state, data ) {
    state[$states.keepLive] = data;
    saveToLocalStorage( { keepLive: data } );
  },

  [$mutations.setDisableBumps] ( state, data ) {
    state[$states.disableBumps] = data;
    saveToLocalStorage( { disableBumps: data } );
  },

  [$mutations.setDetach] ( state, data ) {
    state[$states.detach] = data;
  },
};

// Actions
export const actions = {
  async [$actions.loadSettings] ({ dispatch, commit }) {
    // Check if we have access to localStorage
    if ( localStorage === null ) {
      console.error( 'Cannot access localStorage' );
      return;
    }

    let keeplive = null;
    try {
      keeplive  = localStorage.getItem( 'keepLive' );
    } catch ( error ) {
      console.error( `Failed to get 'keepLive' from localStorage`, error );
    }

    if ( keeplive ) {
      commit( $mutations.setKeepLive, JSON.parse(keeplive) );
      try {
        localStorage.removeItem( 'keepLive' );
      } catch ( error ) {
        console.error( `Failed to remove 'keepLive' from localStorage`, error );
      }
    }

    let playerSettings = null;
    try {
      playerSettings = localStorage.getItem( 'player-settings' );
      playerSettings = JSON.parse( playerSettings );
    } catch ( error ) {
      console.error( `Failed to get 'keepLive' from localStorage`, error );
    }

    if ( !playerSettings || typeof playerSettings !== 'object') {
      return;
    }

    if ( playerSettings.hasOwnProperty( 'keepLive' ) ) commit( $mutations.setKeepLive, playerSettings.keepLive );
    if ( playerSettings.hasOwnProperty( 'disableBumps' ) ) commit( $mutations.setDisableBumps, playerSettings.disableBumps );
  }
};

// Export Store Structure
export const Player = {
  namespace : 'player',
  $states,
  $getters,
  $mutations,
  $actions,
};
