// Define Store states, getters, mutations & actions
import { db } from '@/plugins/firebase.js';

const logger = ( message, data ) => {
  if ( process.client ) {
    if ( data && typeof data === 'object' )
      console.log( `%cCHAT CONFIG:%c ${message} %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', data );
    else
      console.log( `%cCHAT CONFIG:%c ${message}`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '' );
  } else {
    if ( data && typeof data === 'object' )
      console.log( `CHAT CONFIG: ${message} %o`, data );
    else
      console.log( `CHAT CONFIG: ${message}` );
  }
};


const $states = {
  configRef : 'CONFIG_REF',
  pinnedMessage : 'PINNED_MESSAGE',
};

const $getters = {
  getConfig : 'GET_CONFIG',
};

const $mutations = {
  setConfigRef : 'SET_CONFIG_REF',
  setPinnedMessage : 'SET_PINNED_MESSAGE',
};

const $actions = {
  loadConfig : 'LOAD_CONFIG',
  createPinnedMessage : 'CREATE_PINNED_MESSAGE',
};


// Create Store State
export const state = () => ({
  [$states.configRef]     : null,
  [$states.pinnedMessage] : null,
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
  // Pinned message
  [$mutations.setPinnedMessage] ( state, data ) {
    state[$states.pinnedMessage] = data;
  },

  // Pinned message
  [$mutations.setConfigRef] ( state, data ) {
    state[$states.configRef] = data;
  },
};


// Create Store Actions
export const actions = {
  async [$actions.loadConfig] ( { commit }, channel ) {
    const channelQuery = await db
      .collection('streams')
      .where( 'name', '==', channel.toLowerCase() )
      .limit( 1 )
      .get();
    if ( channelQuery.empty ) return;
    const configRef = channelQuery
      .docs[0].ref
      .collection( 'chat-data' )
      .doc( 'config' );
    const configDoc = await configRef.get();
    if ( !configDoc.exists ) return;
    commit( $mutations.setConfigRef, configDoc.ref.path );
    const config = configDoc.data();
    if ( config.hasOwnProperty( 'pinnedMessage' ) ) {
      commit( $mutations.setPinnedMessage, config.pinnedMessage );
    }
  },

  async [$actions.createPinnedMessage] ( { state, commit }, pinnedMessage ) {
    if ( state[$states.configRef] ) {
      await db.doc( state[$states.configRef] ).update({
        pinnedMessage: {
          display: true,
          message: pinnedMessage,
        },
      });
    }
  },
};


// Export Store Structure
export const ChatConfig = {
  namespace : 'channel/chat-config',
  $states,
  $getters,
  $mutations,
  $actions,
};
