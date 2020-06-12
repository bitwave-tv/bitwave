
// Stat is basically any object
// However, it is generally true that it has the functions {get, set}Value()

// Trivial stat with just a value (no histogram)
class Stat {
  constructor( value ) {
    this._value = value;
  }

  get value() { return this._value; }
  set value( value ) { this._value = value; }
}

// Stat that has an array of values, 'histogramSize' long
class StatHistogram {
  constructor( histogramSize = 5 ) {
    this.values = [];
    this.histogramSize = histogramSize;

    for( let i = 1; i < arguments.length; i++ ) {
      if( arguments[i] ) this.values.push( arguments[i] );
    }
  }

  get value() { return this.values[0]; }
  set value( value ) {
    this.values.unshift( value );
    if( this.values.length > this.histogramSize ) {
      this.values.pop();
    }
  }
}

class UserStats {
  // tickPeriod -- time (in seconds) between two calls of stat-calc'ing function
  constructor( tickPeriod ) {
    // Maps usernames to another map of key->Stat
    this.userStats = new Map();
    this.tickPeriod = tickPeriod ? tickPeriod : 1;

    // Faux username for a user representing the total stats for all users
    this.ALL_USER = "all";
    this.defaultHistogramSettings = { create: true, size: 25 };
    this.statNames = new Set();
  }

  // Adds 'username' to the map, if it doesn't already exist
  // 'stats' is something that Map's ctor can turn into useful data
  addUser( username, stats ) {
    if (!this.userStats.get( username ) ) {
      this.userStats.set( username, new Map( stats ) );
    }
  }

  // Gets the map of keys to stats corresponding to 'username'
  getUser( username ) {
    return this.userStats.get( username );
  }

  deleteUser( username ) {
    this.userStats.delete( username );
  }

  // Sets the stat object for 'username'
  // Will create a new user if it doesn't exist
  // Will overwrite any existing stat object. For setting a value, see setStatValue()
  setStat( username, key, statObj ) {
    let user = this.getUser( username );
    if( !user ) {
      this.addUser( username );
      user = this.getUser( username );
    }

    this.statNames.add( key );
    user.set( key, statObj );
  }

  // Sets the stat for 'key' to be 'statObj' for all existing users
  // Will overwrite any existing stat object. For setting a value, see setStatValueAll()
  setStatAll( key, statObj ) {
    this.statNames.add( key );
    this.userStats.forEach( stats => {
      stats.set( key, statObj );
    });
  }

  // Sets the stat value for 'username'
  // Will create a new user if it doesn't exist
  // Will create a new stat, if one doesn't exist
  setStatValue( username, key, value = 0 ) {
    let user = this.getUser( username );
    if( !user ) {
      this.addUser( username );
      user = this.getUser( username );
    }

    const stat = user.get( key );
    if( !stat ) {
      if( this.defaultHistogramSettings.create ) {
        user.set( key, new StatHistogram( this.defaultHistogramSettings.size, value ) );
      } else {
        user.set( key, new Stat( value ) );
      }
    } else {
      stat.value = value;
    }

    this.statNames.add( key );
  }

  // Sets the stat value for 'key' to be 'value' for all existing users
  // Will create a new stat, if the user doesn't have one
  setStatValueAll( key, value = 0 ) {
    this.userStats.forEach( (stats, username) => {
      this.setStatValue( username, key, value );
    });
  }

  // Gets the user's stat object for key
  // For getting a stat value, see getStatValue
  getStat( username, key ) {
    const user = this.getUser( username );
    if( user ) {
      return user.get( key );
    }
  }

  // Gets the value of a stat for a user
  getStatValue( username, key ) {
    const user = this.getUser( username );
    if( user ) {
      const stat = user.get( key );
      if( key ) {
        return stat.value;
      }
    }
  }

  // Sets the value of a stat corresponding to key, belonging to a user to be oldValue + offset
  // Will create a new stat, if one doesn't exist
  // Will create a new user, if one doesn't exist
  offsetStatValue( username, key, offset ) {
    const value = this.getStatValue( username, key );
    if( value !== undefined && value != null ) {
      this.setStatValue( username, key, value + offset );
    } else {
      this.setStatValue( username, key, offset );
    }
  }

  // Increments the value of a stat corresponding to key, belonging to a user
  // Will create a new stat, if one doesn't exist
  // Will create a new user, if one doesn't exist
  incrementStatValue( username, key ) {
    this.offsetStatValue( username, key, 1 );
  }

  // Decrements the value of a stat corresponding to key, belonging to a user
  // Will create a new stat, if one doesn't exist
  // Will create a new user, if one doesn't exist
  decrementStatValue( username, key ) {
    this.offsetStatValue( username, key, -1 );
  }

  // Experimental manual garbage collection. Mileage may vary.
  // Deletes stats that have been '0' for their entire histogram period
  // Deletes users that have no stats
  garbageCollect() {
    this.userStats.forEach( (stats, username) => {
      stats.forEach( (stat, statName) => {
        if( ( stat.values && stat.values.reduce && !stat.values.reduce( (a, b) => a + b ) )
        || ( stat.value && !stat.value ) ) {
          stats.delete( statName );
        }
      });
      if( JSON.stringify( stats ) === JSON.stringify( {} ) ) {
        this.deleteUser( username );
      }
    });
  }

  // Puts # of messages into a messageCount stat
  // Expects 'messages' to have happened within a single period
  // Creates entries for usernames that don't have one
  async calculateMessageCount( messages ) {
    const key = "messageCount";
    this.setStatValueAll( key );
    for( const m of messages ) {
      await this.incrementStatValue( m.username, key );
    }
  }

  // Puts user's messageCount value divided over tickPeriod into a messageRate stat
  // Sets 0 for messageRate if messageCount is falsy
  calculateMessageRateUser( username ) {
    const key = "messageRate";
    const user = this.getUser( username );
    if( user ) {
      const count = this.getStatValue( username, "messageCount" );
      if( count ) {
        this.setStatValue( username, key, count / this.tickPeriod );
      } else {
        this.setStatValue( username, key, 0 );
      }
    }
  }

  // Puts # of messages divided over tickPeriod into a messageRate stat
  // Expects 'messages' to have been within tickPeriod
  async calculateMessageRate( messages ) {
    const key = "messageRate";
    await this.calculateMessageCount( messages );

    // Sadly, setStatValueAll() cannot pass a 'this' before it is called
    this.userStats.forEach( (_, username) => {
      this.calculateMessageRateUser( username );
    });
  }

  // Calculates the rate of messageRate for a single user
  calculateMessageRateDerivativeUser( username ) {
    const key = "messageRateDerivative";
    const messageRate = this.getStat( username, "messageRate" );
    if( messageRate && messageRate.values && messageRate.values.length > 0 ) {
      this.setStatValueAll( key, messageRate.values.reduce((a, b) => a + b) / messageRate.histogramSize );
    } else {
      this.setStatValueAll( key );
    }
  }

  // Although the name implies derivation, since we're dealing with non-continuous,
  // discrete values, it's just an average of messageRates over its histogram period
  // Stores this in a stat called messageRateDerivative
  calculateMessageRateDerivative() {
    const key = "messageRateDerivative";
    this.userStats.forEach( (_, username) => {
      this.calculateMessageRateDerivativeUser( username );
    });
  }

  // Calculates the total amount of messages
  // Stores this into stat messageCount for username this.ALL_USER ("all")
  calculateMessageCountAll( messages ) {
    const key = "messageCount";
    this.setStatValue( this.ALL_USER, key, messages.length );
  }

  // Calculates the rate of posting for all messages
  // Stores this into stat messageRate for username this.ALL_USER ("all")
  async calculateMessageRateAll( messages ) {
    await this.calculateMessageCountAll( messages );
    this.calculateMessageRateUser( this.ALL_USER );
  }

  // Calculates the rate of change of the rate of posting
  // Stores this into stat messageRateDerivative for username this.ALL_USER ("all")
  calculateMessageRateDerivativeAll = () => this.calculateMessageRateDerivativeUser( this.ALL_USER );

  calculateSpamminess( messages ) {
    const key = "spamminess";
    const messageCount = new Map();

    const incrementMessageCount = ( message ) => {
      const value = messageCount.get( message );
      if( value !== undefined && value !== null ) {
        messageCount.set( message, value + 1 );
      } else {
        messageCount.set( message, 0 );
      }
    };

    for( const m of messages ) {
      incrementMessageCount( m.message );
      this.offsetStatValue( m.username, key, messageCount.get( m.message ) ?? 0 );
    }
  }

  calculateSpamminessAll( messages ) {
    const key = "spamminess";
    const messageCount = new Map();

    const incrementMessageCount = ( message ) => {
      const value = messageCount.get( message );
      if( value !== undefined && value !== null ) {
        messageCount.set( message, value + 1 );
      } else {
        messageCount.set( message, 1 );
      }
    };

    for( const m of messages ) {
      incrementMessageCount( m.message );
    }

    const sorted = Array.from( messageCount.values() ).sort()[0];
    this.setStatValue( this.ALL_USER, key, sorted ?? 1 );
  }

  calculateNicenessUser( username, sensitivity ) {
    const key = "niceness";

    const messageCount = this.getStatValue( username, "messageCount" ) ?? 0;
    const messageRate = this.getStatValue( username, "messageRate" ) ?? 0;
    const spamminess = this.getStatValue( username, "spamminess" ) ?? 0;

    this.setStatValue( username, key, ( messageCount * spamminess * sensitivity ) + messageRate );
  }

}

export { UserStats };
