// Created by xander on 1/22/2020

import * as utils from '@/plugins/store-utils.js';
const saveToLocalStorage = values => utils.saveToLocalStorage( 'player-settings', values );

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
  [$states.disableBumps]: true,
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
    // TODO(diingus): It is not obvious to me why keepLive is read separately, as it's
    //                never written to directly (only through saveToLocalStorage() which
    //                saves it wrapped in a single object), and git grep is inconclusive
    const keeplive = utils.readFromLocalStorage( 'keepLive' );
    if ( keeplive ) {
      commit( $mutations.setKeepLive, JSON.parse(keeplive) );
      try {
        localStorage.removeItem( 'keepLive' );
      } catch ( error ) {
        console.error( `Failed to remove 'keepLive' from localStorage`, error );
      }
    }

    utils.loadFromLocalStorage( 'player-settings', commit,
      new Map(
        [
          ['keepLive', $mutations.setKeepLive],
          ['disableBumps', $mutations.setDisableBumps],
      ])
    );
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
