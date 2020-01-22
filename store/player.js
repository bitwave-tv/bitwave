// Created by xander on 1/22/2020

const $states = {
  source: 'VIDEO_SRC',

  keepLive: 'KEEP_LIVE',
  detach: 'DETACH',
};

const $getters = {

};

const $mutations = {
  setSource: 'SET_VIDEO_SRC',

  setKeepLive: 'SET_KEEP_LIVE',
  setDetach: 'SET_DETACH',
};

const $actions = {
  loadSettings: 'LOAD_SETTINGS',
};


// Create Store
export const state = () => ({
  [$states.source]: { url: '', type: '' },

  [$states.keepLive]: false,
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

  [$mutations.setKeepLive] ( state, data ) {
    state[$states.keepLive] = data;
    localStorage.setItem( 'keepLive', data );
  },

  [$mutations.setDetach] ( state, data ) {
    state[$states.detach] = data;
  },
};

// Actions
export const actions = {
  [$actions.loadSettings] ({ dispatch, commit }) {
    const keeplive = localStorage.getItem( 'keepLive' );
    if ( keeplive ) commit( $mutations.setKeepLive, JSON.parse(keeplive) );
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
