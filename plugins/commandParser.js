import { Chat } from '@/store/chat';
import { VStore } from "@/store";


/**
 * Creates the functions that run for the chat commands
 * */
const createFunctions = ( _store, _store_state, _store_commit, _store_action, _ga, _sentry ) => ({

  // --- LOCAL vs GLOBAL --- //
  /**
   * Enables local chat
   * */
  setLocalChat () {
    _store_commit( Chat.$mutations.setGlobal, false );
    return [
      { insertMessage: `Local chat.` },
    ];
  },

  /**
   * Enables global chat
   * */
  setGlobalChat () {
    _store_commit( Chat.$mutations.setGlobal, true );
    return [
      { insertMessage: `Global chat.` },
    ];
  },



  // --- IGNORE USER COMMANDS --- //
  /**
   * IGNORE USER
   * */
  async ignoreUser ( who ) {
    if ( !who ) {
      return [
        { insertMessage: `You did not specify a username to ignore.` }
      ];
    }

    if( who.toLowerCase() === '[bitwave.tv]' ) {
      return [
        { insertMessage: "I'm afraid I can't let you do that, Dave." }
      ];
    }

    const ignoreList = _store_state[Chat.$states.ignoreList];

    who = who.replace( '@', '' ).toLowerCase();
    const exists = ignoreList.find( el => el.toLowerCase() === who );
    if( exists ) {
      return [
        { insertMessage: `You already ignore '${ who }'` }
      ];
    }

    await _store_commit( Chat.$mutations.addIgnoreList, who );

    // Analytics
    _ga.event( {
      eventCategory: 'chat',
      eventAction: 'ignore',
      eventLabel: who,
    } );

    return [
      { saveToDb: [ 'users', 'ignoreList', ignoreList ] },
      { forceFilter: message => who !== message.username.toLowerCase() },
      { insertMessage: `Ignored User: ${ who }` },
    ];
  },

  /**
   * UN-IGNORE USER
   * */
  async unignoreUser ( who ) {
    if ( !who ) {
      return [
        { insertMessage: `You did not specify a username to unignore.` }
      ];
    }

    const ignoreList = _store_state[ Chat.$states.ignoreList ];

    who = who.replace( '@', '' ).toLowerCase();
    const exists = ignoreList.find( el => el.toLowerCase() === who );
    if( exists ) {
      await _store_commit( Chat.$mutations.removeIgnoreList, who );

      const ignoreListUpdated = _store_state[ Chat.$states.ignoreList ];

      // Analytics
      _ga.event( {
        eventCategory: 'chat',
        eventAction: 'unignore',
        eventLabel: who,
      } );

      return [
        { saveToDb: [ 'users', 'ignoreList', ignoreListUpdated ] },
        { insertMessage: `Unignored User: ${ who }` }
      ];
    } else {
      return [
        { insertMessage: `You are not ignoring '${ who }'` }
      ];
    }
  },

  /**
   * PURGE IGNORE USER
   * */
  async purgeIgnoreUser () {
    const ignoreList = _store_state[ Chat.$states.ignoreList ];
    await _store_commit( Chat.$mutations.purgeIgnoreList );
    const ignoreListUpdated = _store_state[ Chat.$states.ignoreList ];

    // Analytics
    _ga.event( {
      eventCategory: 'chat',
      eventAction: 'purge-ignore',
      eventLabel: 'purge-users',
    } );

    return [
      { saveToDb: [ 'users', 'ignoreList', ignoreListUpdated ] },
      { insertMessage: `Purged all users from ignore user list!` },
    ];
  },



  // --- IGNORE CHANNEL COMMANDS --- //
  /**
   * IGNORE CHANNEL
   * */
  async ignoreChannel ( who ) {
    if ( !who ) {
      return [
        { insertMessage: `You did not specify a channel to ignore.` }
      ];
    }

    const ignoreChannelList = _store_state[ Chat.$states.ignoreChannelList ];

    who = who.replace( '@', '' ).toLowerCase();
    const exists = ignoreChannelList.find( el => el.toLowerCase() === who );
    if( exists ) {
      return [
        { insertMessage: `Channel already ignored ${ who }` }
      ];
    }

    await _store_commit( Chat.$mutations.addIgnoreChannelList, who );

    // Analytics
    _ga.event( {
      eventCategory: 'chat',
      eventAction: 'ignore-channel',
      eventLabel: who,
    } );

    return [
      { saveToDb: [ 'users', 'ignoreChannelList', ignoreChannelList ] },
      { forceFilter: message => who !== message.username.toLowerCase() },
      { insertMessage: `Ignored Channel: ${ who }` },
    ];
  },

  /**
   * UN-IGNORE CHANNEL
   * */
  async unignoreChannel ( who ) {
    if ( !who ) {
      return [
        { insertMessage: `You did not specify a channel to unignore.` },
      ];
    }

    const ignoreChannelList = _store_state[ Chat.$states.ignoreChannelList ];

    who = who.replace( '@', '' ).toLowerCase();
    const exists = ignoreChannelList.includes( who );
    if( exists ) {
      await _store_commit( Chat.$mutations.removeIgnoreChannelList, who );

      const ignoreChannelListUpdated = _store_state[ Chat.$states.ignoreChannelList ];

      // Analytics
      _ga.event( {
        eventCategory: 'chat',
        eventAction: 'unignore-channel',
        eventLabel: who,
      } );

      return [
        { saveToDb: [ 'users', 'ignoreChannelList', ignoreChannelListUpdated ] },
        { insertMessage: `Unignored Channel: ${ who }` },
      ];
    } else {
      return [
        { insertMessage: `You do not ignore ${ who }'s channel` },
      ];
    }

  },

  /**
   * PURGE IGNORE CHANNEL
   * */
  async purgeIgnoreChannel () {
    await _store_commit( Chat.$mutations.purgeIgnoreChannelList );
    const ignoreChannelListUpdated = _store_state[ Chat.$states.ignoreChannelList ];

    // Analytics
    _ga.event( {
      eventCategory: 'chat',
      eventAction: 'purge-ignore',
      eventLabel: 'purge-channels',
    } );

    return [
      { saveToDb: [ 'users', 'ignoreChannelList', ignoreChannelListUpdated ] },
      { insertMessage: `Purged all channels from ignore channel list!` },
    ];
  },



  /**
   * Print user's ignore lists
   * */
  printIgnoreList () {
    const _ignoreList = _store_state[Chat.$states.ignoreList];
    const _ignoreChannelList = _store_state[Chat.$states.ignoreChannelList];
    _ga.event( {
      eventCategory: 'chat',
      eventAction: 'ignorelist',
      eventLabel: `show-ignore-list`
    } ); // Analytics
    return [
      { insertMessage: `Ignored Users: ${ _ignoreList.join( ', ' ) }` },
      { insertMessage: `Ignored Channels: ${ _ignoreChannelList.join( ', ' ) }` },
    ];
  },



  // --- DEVELOPMENT HELPERS --- ///
  /**
   * DEV HELPER- GET AUTH TOKEN
   * */
  async getAuthToken () {
    console.log( _store.state );
    const auth = _store.state[ VStore.$states.auth ];
    if ( auth ) {
      try {
        const token = auth.accessToken;
        await navigator.clipboard.writeText( token );
        return [
          { insertMessage: `Token copied to clipboard!` },
        ];
      } catch ( error ) {
        return [
          { insertMessage: `Failed to copy token: ${error.message}` },
        ];
      }
    } else {
      return [
        { insertMessage: `Not Authorized! Are you even logged it?` },
      ];
    }
  },

  /**
   * DEV HELPER- GET CHAT TOKEN
   * */
  async getChatToken () {
    console.log( _store.state );
    const token = _store_state[ Chat.$states.chatToken ];
    if ( token ) {
      try {
        await navigator.clipboard.writeText( token );
        return [
          { insertMessage: `Token copied to clipboard!` },
        ];
      } catch ( error ) {
        return [
          { insertMessage: `Failed to copy token: ${error.message}` },
        ];
      }
    } else {
      return [
        { insertMessage: `No token! you broke it... way to go.` },
      ];
    }
  },

  /**
   * Creates sentry bug report
   * */
  async bugReport () {
    _sentry.withScope(
      scope => {
        scope.setExtra( 'global_chat', _store_state[ Chat.$states.global ] );
        scope.setExtra( 'is_auth', _store.state[ VStore.namespace ][ VStore.$states.auth ] );
        scope.setUser( {
          username: this.username,
        } );
        this.$sentry.captureMessage( 'Bug Report' );
      },
    );
    _sentry.showReportDialog( {
      title: 'Something looks broken...',
      labelName: 'Username',
      labelSubmit: 'Submit Bug Report',
    } );
    return [
      { insertMessage: `Bug report sent. Thank you.` },
    ];
  },

  /**
   * Toggle badge on / off
   * */
  async toggleBadge () {
    const newstate = !_store_state[Chat.$states.showBadge];
    await _store_commit( Chat.$mutations.setShowBadge, newstate );
    return [{ insertMessage: `Badge ${ newstate ? 'on' : 'off' }` }]
  },



  // --- ADDITIONAL FILTERING TOOLS --- //
  /**
   * Toggle trolls in chat
   * */
  async hideTrolls () {
    const hideTrolls = !_store_state[ Chat.$states.hideTrolls ];
    await _store_commit( Chat.$mutations.setHideTrolls, hideTrolls );
    return [
      { forceFilter: el => !el.username.startsWith( 'troll:' ) },
      { insertMessage: `Trolls: ${!hideTrolls ? 'Allowed (Show Trolls)' : 'Disabled (Hide Trolls)'}` },
    ];
  },

  /**
   * Clean(er) TTS
   * */
  async cleanTts () {
    await _store_commit( Chat.$mutations.setCleanTts, !_store_state[ Chat.$states.cleanTts ] );
    return [
      { insertMessage: `Clean TTS: ${ _store_state[ Chat.$states.cleanTts ] }` }
    ];
  },

  /**
   * TOGGLE HIGH DENSITY
   * */
  async toggleHighDensity () {
    const highDensity = !_store_state[ Chat.$states.highDensity ];
    await _store_commit( Chat.$mutations.setHighDensity, highDensity );

    // Analytics
    _ga.event( {
      eventCategory: 'chat',
      eventAction: 'QOL',
      eventLabel: `${highDensity ? 'enable' : 'disable'}-high-density`,
    } );

    return [
      { insertMessage: `High Density: ${highDensity ? 'enabled' : 'disabled'}` },
    ];
  },

  /**
   * Skips TTS Messages
   * */
  skipTts () {
    speechSynthesis.cancel();
    return [];
  },



  // --- MISC. COMMANDS --- //
  /**
   * Magic VooDoo
   * */
  graph ( stat, user ) {
    return [
      { changeStatOnGraph: [ stat, user ] },
    ];
  },



  // --- STILL NOT DONE YET HOLY SHIT --- //
  /**
   * Something that has taken way too long to fix
   * */
  async whisper ( who, ...what ) {
    try {
      const result = await _store_action( Chat.$actions.sendWhisper, { receiver: who, message: what.join( ' ' ) } );
      console.log( `Whisper result:`, result );
      if ( result && result.success ) {
        return [
          // { insertMessage: `Sent Whisper to ${who}: ${result.success} - ${result.message}` },
        ];
      } else {
        return [
          { insertMessage: `🛑 Whisper Failed: ${result.message} 🛑` },
        ];
      }
    } catch ( error ) {
      console.error( error.message );
      return [
        { insertMessage: `Whisper Failed: ${result.message}` },
      ];
    }
  },

  // Dialogs
  /**
   * Shows a specific dialog to user
   * */
  showIgnoreList () {
    const _ignoreList        = _store_state[ Chat.$states.ignoreList ];
    const _ignoreChannelList = _store_state[ Chat.$states.ignoreChannelList ];

    _ga.event ({
      eventCategory: 'chat',
      eventAction: 'ignorelist',
      eventLabel: `show-ignore-list`
    }); // Analytics

    return [
      // Show ignore list dialog
      { showDialog: 'ignorelist' },

      // Show ignore list in chat
      { insertMessage: `Ignored Users: ${ _ignoreList.join( ', ' ) }` },
      { insertMessage: `Ignored Channels: ${ _ignoreChannelList.join( ', ' ) }` },
    ];
  },
});


/**
 * Creates the chat parsing object using the supplied functions
 * */
const createParser = parserFns => ({

  // Creates a map of commands and their associated functions
  commands: new Map([
    // Switching environments
    ["dev",        () => [{ chatServer: 'DEV'  }, { insertMessage: 'Enabled developer mode.\nAttempting to connect to local dev server.' }]],
    ["prod",       () => [{ chatServer: 'PROD' }, { insertMessage: 'Disabled developer mode.\nAttempting to connect to production chat server.' }]],
    ["production", () => [{ chatServer: 'PROD' }, { insertMessage: 'Disabled developer mode.\nAttempting to connect to production chat server.' }]],

    // Local vs. Global
    [ "local",           parserFns.setLocalChat ],
    [ "global",          parserFns.setGlobalChat ],

    // Ignore Users
    [ "ignore",          parserFns.ignoreUser ],
    [ "i",               parserFns.ignoreUser ],
    [ "unignore",        parserFns.unignoreUser ],
    [ "u",               parserFns.unignoreUser ],
    [ "purgeusers",      parserFns.purgeIgnoreUser ],

    // Ignore Channels
    [ "ignorechannel",   parserFns.ignoreChannel ],
    [ "ic",              parserFns.ignoreChannel ],
    [ "unignorechannel", parserFns.unignoreChannel ],
    [ "uic",             parserFns.unignoreChannel ],
    [ "uc",              parserFns.unignoreChannel ],
    [ "purgechannels",   parserFns.purgeIgnoreChannel ],

    // Ignore List
    [ "ignorelist",      parserFns.showIgnoreList ],

    // High Density
    [ "highdensity",     parserFns.toggleHighDensity ],
    [ "dense",           parserFns.toggleHighDensity ],

    // Toggle trolls
    [ "troll",           parserFns.hideTrolls ],
    [ "trolls",          parserFns.hideTrolls ],
    [ "safespace",       parserFns.hideTrolls ],
    [ "hugbox",          parserFns.hideTrolls ],
    [ "susi",            parserFns.hideTrolls ],

    // Clean TTS
    [ "cuckrockchris",   parserFns.cleanTts ],
    [ "crc",             parserFns.cleanTts ],
    [ "cleantts",        parserFns.cleanTts ],

    // Skip TTS
    [ "skip",            parserFns.skipTts ],
    [ "s",               parserFns.skipTts ],

    // Misc.
    [ "badge",           parserFns.toggleBadge ],
    [ "bugreport",       parserFns.bugReport ],
    [ "graph",           parserFns.graph ],
    [ "token",           parserFns.getAuthToken ],
    [ "chattoken",       parserFns.getChatToken ],


    // TODO: fix whispers :trout:
    // Whispers
    [ "whisper", parserFns.whisper ],
    [ "w",       parserFns.whisper ],
  ]),


  // Spread in all of our functions
  ...parserFns,


  /**
   * parse command
   * @param str
   * @return {Promise<null|undefined|*>}
   */
  async parseOne ( str ) {

    // All commands must start with a slash
    if ( !str.startsWith( '/' ) ) return null;

    // Extracts out command & arguments (I think)
    const tokens = str
      .replace ( '/', '' )        // strip slash from start of command
      .split ( ' ' )              // split command at each space
      .filter ( t => t.length );  // used to remove extra spaces

    // token[0] is our command word.
    // We use shift to both remove it
    // from the array and get it's value.
    // Then force lowercase to ignore casing
    const commandToken = ( tokens.shift() ).toLowerCase();

    // Attempt to find matching command
    const command = this.commands.get( commandToken );

    // if there is a matching command,
    // then run it (with the arguments)!
    if ( command ) return await command ( ...tokens );

    // else return undefined
    return undefined;
  },

});

export default async ( { $ga, store, $sentry }, inject ) => {
  // Create shortcuts to parts of our store
  const _state  = await store.state[ Chat.namespace ];
  const _commit = async ( what, ...args ) => await store.commit   ( `${Chat.namespace}/${what}`, ...args );
  const _action = async ( what, ...args ) => await store.dispatch ( `${Chat.namespace}/${what}`, ...args );

  // Generate parser functions from context, then create parser object
  const parserFunctions = createFunctions ( store, _state, _commit, _action, $ga, $sentry );
  const chatParser = createParser ( parserFunctions );

  // Inject parser into context
  inject ( 'chatCommandParser', chatParser );
}
