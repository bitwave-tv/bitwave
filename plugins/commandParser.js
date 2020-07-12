import { Chat } from '@/store/chat';

let _store, _ga, _sentry;

const ignoreUser = async ( who ) => {
  const ignoreList = _store.state[ Chat.namespace ][ Chat.$states.ignoreList ];

  who = who.replace('@','');
  const exists = ignoreList.find( el => el.toLowerCase() === who.toLowerCase() );
  if( exists ) {
    return [
      {insertMessage: `You already ignore '${who}'`}
    ];
  }

  await _store.commit( `${Chat.namespace}/${Chat.$mutations.addIgnoreList}`, who );

  // Analytics
  _ga.event({
    eventCategory : 'chat',
    eventAction   : 'ignore',
    eventLabel    : who,
  });

  return [
    { saveToDb: ['users', 'ignoreList',  ignoreList] },
    { forceFilter: message => who.toLowerCase() !==  message.username.toLowerCase() },
    { insertMessage: `Ignored User: ${who}` },
  ];
};

const unignoreUser = async ( who ) => {
  const ignoreList = _store.state[ Chat.namespace ][ Chat.$states.ignoreList ];

  who = who.replace('@','');
  const exists = ignoreList.find( el => el.toLowerCase() === who.toLowerCase() );
  if( exists ) {
    await _store.commit( `${Chat.namespace}/${Chat.$mutations.removeIgnoreList}`, who.toLowerCase() );

    // Analytics
    _ga.event({
      eventCategory : 'chat',
      eventAction   : 'unignore',
      eventLabel    : who,
    });

    return [
      { insertMessage: `Unignored User: ${who}` }
    ];
  } else {
    return [
      { insertMessage: `You are not ignoring '${who}'` }
    ];
  }
};

const ignoreChannel = async ( who ) => {
  const ignoreChannelList = _store.state[ Chat.namespace ][ Chat.$states.ignoreChannelList ];

  const exists = ignoreChannelList.find( el => el.toLowerCase() === channel.toLowerCase() );
  if ( exists ) {
    return [
      { insertMessage: `Channel already ignored ${who}` }
    ];
  }

  await _store.commit( `${Chat.namespace}/${Chat.$mutations.addIgnoreChannelList}`, who );

  // Analytics
  _ga.event({
    eventCategory : 'chat',
    eventAction   : 'ignore-channel',
    eventLabel    : who,
  });

  return [
    { saveToDb: ['users', 'ignoreChannelList',  ignoreChannelList] },
    { forceFilter: message => who.toLowerCase() !==  message.username.toLowerCase() },
    { insertMessage: `Ignored User: ${who}` },
  ];
};

const unignoreChannel = async ( who ) => {
  const ignoreChannelList = _store.state[ Chat.namespace ][ Chat.$states.ignoreChannelList ];

  const exists = ignoreChannelList.includes( who.toLowerCase() );
  if ( exists ) {
    await _store.commit( `${Chat.namespace}/${Chat.$mutations.removeIgnoreChannelList}`, who.toLowerCase() );

    // Analytics
    _ga.event({
      eventCategory : 'chat',
      eventAction   : 'unignore-channel',
      eventLabel    : who,
    });

    return [
      { insertMessage: `Unignored Channel: ${who}` },
      { saveToDb: ['users', 'ignoreChannelList', ignoreChannelList] }
    ];
  } else {
    return [ { insertMessage: `You do not ignore ${who}'s channel` } ];
  }

};

const hideTrolls = async () => {
  // TODO: add to store
  await _store.commit( `${Chat.namespace}/${Chat.$mutations.setHideTrolls}`, !_store.state[ Chat.namespace ][ Chat.$states.hideTrolls ] );
  return [
    { forceFilter: el => !el.username.startsWith( 'troll:' ) }
  ];
};

const cleanTts = async () => {
  // TODO: add to store
  await _store.commit( `${Chat.namespace}/${Chat.$mutations.setCleanTts}`, !_store.state[ Chat.namespace ][ Chat.$states.cleanTts ] );
  return [
    { insertMessage: `Clean TTS: ${this.cleanTTS}` }
  ];
};

const graph = ( stat, user ) => [ { changeStatOnGraph: [ stat, user ] } ];

const ignoreList = () => {
  const _ignoreList = _store.state[ Chat.namespace ][ Chat.$states.ignoreList ];
  const _ignoreChannelList = _store.state[ Chat.namespace ][ Chat.$states.ignoreChannelList ];
  _ga.event({
    eventCategory : 'chat',
    eventAction   : 'ignorelist',
  }); // Analytics
  return [
    { insertMessage: `Ignored Users: ${_ignoreList.join(', ')}` },
    { insertMessage: `Ignored Channels: ${_ignoreChannelList.join(', ')}` },
  ]
};

const toggleBadge = async () => {
  const newstate = !_store.state[ Chat.namespace ][ Chat.$states.showBadge ];
  await _store.commit( `${Chat.namespace}/${Chat.$mutations.setShowBadge}`, newstate );
  return [ { insertMessage: `Badge ${newstate ? 'on' : 'off'}` } ]
};

const skipTts = () => speechSynthesis.cancel(); // Skip TTS

const bugReport = async () => {
  _sentry.withScope(
    scope => {
      scope.setExtra( 'global_chat', this.global );
      scope.setExtra( 'is_auth', this.isAuth );
      scope.setUser({
        username: this.username,
      });
      this.$sentry.captureMessage( 'Bug Report' );
    },
  );
  _sentry.showReportDialog({
    title: 'Something looks broken...',
    labelName: 'Username',
    labelSubmit: 'Submit Bug Report',
  });
  return [];
};

const export_obj = {

  commands: new Map([
    ["dev", () => [{ chatServer: 'DEV' }, { insertMessage: 'Enabled developer mode.\nAttempting to connect to local dev server.' }]],
    ["prod", () => [{ chatServer: 'PROD' }, { insertMessage: 'Disabled developer mode.\nAttempting to connect to production chat server.' }]],
    ["production", () => [{ chatServer: 'PROD' }, { insertMessage: 'Disabled developer mode.\nAttempting to connect to production chat server.' }]],
    ["local", () => { _store.commit( `${Chat.namespace}/${Chat.$mutations.setGlobal}`, false ); return []; } ],
    ["global", () => { _store.commit( `${Chat.namespace}/${Chat.$mutations.setGlobal}`, true ); return []; } ],
    ["ignore", ignoreUser],
    ["i", ignoreUser],
    ["unignore", unignoreUser],
    ["u", unignoreUser],
    ["ignorechannel", ignoreChannel],
    ["ic", ignoreChannel],
    ["unignorechannel", unignoreChannel],
    ["uic", unignoreChannel],
    ["uc", unignoreChannel],
    ["trolls", hideTrolls],
    ["susi", hideTrolls],
    ["cuckrockchris", cleanTts],
    ["crc", cleanTts],
    ["cleantts", cleanTts],
    ["graph", graph],
    ["ignorelist", ignoreList],
    ["badge", toggleBadge],
    ["skip", skipTts],
    ["s", skipTts],
    ["bugreport", bugReport],
  ]),

  async parseOne( string ) {
    if( !string.startsWith( '/' ) ) return null;
    const tokens = string.replace( '/', '' ).split( ' ' );
    const command = this.commands.get( tokens[0] );

    if( command ) {
      tokens.shift();
      return await command( ...tokens );
    }

    return [];
  },

};

export default async ( { $ga, store, $sentry }, inject ) => {
  _store = store;
  _ga = $ga;
  _sentry = $sentry;
  inject( 'chatCommandParser', export_obj );
}
