export const saveToLocalStorage = ( key, values ) => {
  try {
    let existing = localStorage.getItem( key );
    existing = JSON.parse( existing ) || {};
    const data = JSON.stringify( { ...existing, ...values } );
    if ( data ) localStorage.setItem( key, data );
  } catch ( error ) {
    console.error( 'Failed to save to localStorage', error );
  }
};

export const logger = ( key, message, data ) => {
  if ( process.client ) {
    if ( data && typeof data === 'object' )
      console.log( `%c${key}:%c ${message} %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', data );
    else
      console.log( `%c${key}:%c ${message}`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '' );
  } else {
    if ( data && typeof data === 'object' )
      console.log( `${key}: ${message} %o`, data );
    else
      console.log( `${key}: ${message}` );
  }
};

// Simple read from 'key'. Returns value directly.
export const readFromLocalStorage = key => {
  // Check if we have access to localStorage
  if ( localStorage === null ) {
    console.error( 'Cannot access localStorage' );
    return;
  }

  let value = null;
  try {
    value = localStorage.getItem( key );
  } catch ( error ) {
    console.error( `Failed to get ${key} from localStorage`, error );
  }

  return value;
};

// Since saveToLocalStorage() saves several values under same key in a single object,
// this function reads the value, parses the props and commits them to store.
// 'commit' is the store commit function
// 'props' is a map from property names to mutation names
export const loadFromLocalStorage = ( key, commit, props ) => {
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
