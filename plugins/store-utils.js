export const saveToLocalStorage = ( key, values ) => {
  try {
    let existing = localStorage.getItem( key );
    existing = JSON.parse( existing ) || {};
    const data = JSON.stringify( { ...existing, ...values } );
    if ( data ) localStorage.setItem( key, data );
  } catch ( error ) {
    console.warn( 'Failed to save to localStorage', error );
  }
};

export const logger = ( key, message, data ) => {
  if ( process.client ) {
    if ( data !== undefined ) {
      console.log( `%c${key}:%c ${message}:`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '', data );
    } else
      console.log( `%c${key}:%c ${message}`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '' );
  } else {
    if ( data !== undefined )
      console.log( `${key}: ${message}`, data );
    else
      console.log( `${key}: ${message}` );
  }
};

// Simple read from 'key'. Returns value directly.
export const readFromLocalStorage = key => {
  // Check if we have access to localStorage
  try {
    if ( localStorage === null ) {
      console.warn( 'Cannot access localStorage' );
      return;
    }
  } catch ( error ) {
    console.warn( 'Cannot access localStorage', error.message );
  }


  let value = null;
  try {
    value = localStorage.getItem( key );
  } catch ( error ) {
    console.warn( `Failed to get ${key} from localStorage`, error );
  }

  return value;
};

// Since saveToLocalStorage() saves several values under same key in a single object,
// this function reads the value, parses the props and commits them to store.
// 'commit' is the store commit function
// 'props' is a map from property names to mutation names
export const loadFromLocalStorage = ( key, commit, props ) => {
  console.groupCollapsed(`%c${key}:%c %s`, 'background: #006064; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '', '⏳ Loading settings from local storage...' );
  let value = readFromLocalStorage( key );

  try {
    value = JSON.parse( value );
  } catch ( error ) {
    console.error( `Failed to parse ${key} from localStorage`, error );
  }

  if( !value || typeof value !== 'object') {
    console.log( `Invalid value for ${key} read from local storage: `, value );
    return;
  }

  let readAll = true;
  for( const prop of props.keys() ) {
    if( value.hasOwnProperty( prop ) ) {
      console.log( props.get( prop ), value[prop] );
      commit( props.get( prop ), value[prop] );
    } else {
      console.warn( `Couldn't get property '${prop}' for '${key}', read from localStorage` );
      readAll = false;
    }
  }

  console.groupEnd();
  return readAll;
};

// Calls callback with value read from 'location' in localStorage before deleting it
export const migrate = ( location, callback ) => {
  let value = readFromLocalStorage( location );

  if ( value !== null ) {
    callback( value );
    try {
      localStorage.removeItem( location );
    } catch ( error ) {
      console.error( `Failed to remove '${location}' from localStorage`, error );
    }
  }
};

export const saveToDb = async ( db, uid, collection, field, value ) => {
  const userDoc = db.collection( collection ).doc( uid );
  await userDoc.update( field, value );
};

export const saveToDbCallback = async ( db, uid, collection, field, value, callback ) => {
  await saveToDb( db, uid, collection, field, value );
  callback( { [field]: value} );
};
