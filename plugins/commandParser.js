import { Chat } from '@/store/chat';
import { VStore } from "@/store";

let _store, _ga, _sentry,
    _store_state, _store_commit;

const functions = {

  /**
   * IGNORE USER
   * */
  async ignoreUser ( who ) {
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


  /**
   * IGNORE CHANNEL
   * */
  async ignoreChannel ( who ) {
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
      return [{ insertMessage: `You do not ignore ${ who }'s channel` }];
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



  async hideTrolls() {
    await _store_commit( Chat.$mutations.setHideTrolls, !_store_state[ Chat.$states.hideTrolls ] );
    return [
      { forceFilter: el => !el.username.startsWith( 'troll:' ) }
    ];
  },

  async cleanTts() {
    await _store_commit( Chat.$mutations.setCleanTts, !_store_state[ Chat.$states.cleanTts ] );
    return [
      { insertMessage: `Clean TTS: ${ _store_state[ Chat.$states.cleanTts ] }` }
    ];
  },

  graph( stat, user ) { return [{ changeStatOnGraph: [stat, user] }] },

  ignoreList() {
    const _ignoreList = _store_state[Chat.$states.ignoreList];
    const _ignoreChannelList = _store_state[Chat.$states.ignoreChannelList];
    _ga.event( {
      eventCategory: 'chat',
      eventAction: 'ignorelist',
    } ); // Analytics
    return [
      { insertMessage: `Ignored Users: ${ _ignoreList.join( ', ' ) }` },
      { insertMessage: `Ignored Channels: ${ _ignoreChannelList.join( ', ' ) }` },
    ]
  },

  async toggleBadge() {
    const newstate = !_store_state[Chat.$states.showBadge];
    await _store_commit( Chat.$mutations.setShowBadge, newstate );
    return [{ insertMessage: `Badge ${ newstate ? 'on' : 'off' }` }]
  },

  skipTts() { speechSynthesis.cancel(); }, // Skip TTS

  async bugReport() {
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
    return [];
  },

  whisper( who, ...what ) {
    return [];
  }
};

const export_obj = {

  commands: new Map([
    ["dev", () => [{ chatServer: 'DEV' }, { insertMessage: 'Enabled developer mode.\nAttempting to connect to local dev server.' }]],
    ["prod", () => [{ chatServer: 'PROD' }, { insertMessage: 'Disabled developer mode.\nAttempting to connect to production chat server.' }]],
    ["production", () => [{ chatServer: 'PROD' }, { insertMessage: 'Disabled developer mode.\nAttempting to connect to production chat server.' }]],
    ["local", () => { _store_commit( Chat.$mutations.setGlobal, false ); return []; } ],
    ["global", () => { _store_commit( Chat.$mutations.setGlobal, true ); return []; } ],
    ["ignore", functions.ignoreUser],
    ["i", functions.ignoreUser],
    ["unignore", functions.unignoreUser],
    ["u", functions.unignoreUser],
    ["purgeusers", functions.purgeIgnoreUser],
    ["ignorechannel", functions.ignoreChannel],
    ["ic", functions.ignoreChannel],
    ["unignorechannel", functions.unignoreChannel],
    ["uic", functions.unignoreChannel],
    ["uc", functions.unignoreChannel],
    ["purgechannels", functions.purgeIgnoreChannel],
    ["trolls", functions.hideTrolls],
    ["susi", functions.hideTrolls],
    ["cuckrockchris", functions.cleanTts],
    ["crc", functions.cleanTts],
    ["cleantts", functions.cleanTts],
    ["graph", functions.graph],
    ["ignorelist", functions.ignoreList],
    ["badge", functions.toggleBadge],
    ["skip", functions.skipTts],
    ["s", functions.skipTts],
    ["bugreport", functions.bugReport],
    // TODO: fix whispers :trout:
    ["whisper", functions.whisper],
    ["w", functions.whisper],
  ]),

  ...functions,

  async parseOne( string ) {
    if( !string.startsWith( '/' ) ) return null;
    const tokens = string.replace( '/', '' ).split( ' ' ).filter( t => t.length );
    const command = this.commands.get( tokens[0] );

    if( command ) {
      tokens.shift();
      return await command( ...tokens );
    }

    return undefined;
  },

};

export default async ( { $ga, store, $sentry }, inject ) => {
  _store = store;
  _store_state = await store.state[ Chat.namespace ];
  _store_commit = async ( what, ...args ) => {
    return await _store.commit( `${Chat.namespace}/${what}`, ...args );
  };
  _ga = $ga;
  _sentry = $sentry;
  inject( 'chatCommandParser', export_obj );
}
