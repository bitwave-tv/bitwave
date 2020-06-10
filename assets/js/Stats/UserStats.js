
// Stat is basically any object
// However, it is generally true that it has the functions {get, set}Value()

// Trivial stat with just a value (no histogram)
class Stat {
  constructor( value ) {
    this.value = value;
  }

  getValue() { return this.value; }
  setValue( value ) { this.value = value; }
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

  getValue() { return this.values[0]; }
  setValue( value ) {
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
  }

  // Adds 'username' to the map, if it doesn't already exist
  // 'stats' is something that Map's ctor can turn into useful data
  addUser(username, stats ) {
    if( !this.userStats.get( username ) ) {
      this.userStats.set( username, new Map( stats ) );
    }
  }

  // Gets the map of keys to stats corresponding to 'username'
  getUser(username ) {
    return this.userStats.get( username );
  }

  deleteUser(username ) {
    this.userStats.delete( username );
  }

  // Sets the stat object for 'username'
  // Will create a new user if it doesn't exist
  // Will overwrite any existing stat object. For setting a value, see setStatValue()
  setStat( username, key, statObj ) {
    let user = this.getUser( username );
    if( !user ) {
      this.addUser( username )
      user = this.getUser( username );
    }

    user.set( key, statObj );
  }

  // Sets the stat for 'key' to be 'statObj' for all existing users
  // Will overwrite any existing stat object. For setting a value, see setStatValueAll()
  setStatAll( key, statObj ) {
    this.userStats.forEach( stats => {
      stats.set( key, statObj );
    });
  }

  // Sets the stat value for 'username'
  // Will create a new user if it doesn't exist
  // Will create a new stat, if one doesn't exist
  setStatValue( username, key, value = 0, histogram = { create: true, size: 5 } ) {
    let user = this.getUser( username );
    if( !user ) {
      this.addUser( username );
      user = this.getUser( username );
    }

    const stat = user.get( key );
    if( !stat ) {
      if( histogram.create ) {
        user.set( key, new StatHistogram( histogram.size, value ) );
      } else {
        user.set( key, new Stat( value ) );
      }
    } else {
      stat.setValue( value );
    }
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
        return stat.getValue();
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
      stats.forEach( object => {
        for( const prop in object ) {
          if( object.hasOwnProperty( prop ) && object[prop].reduce && !object[prop].reduce( (a, b) => a + b ) ) {
            delete object[prop];
          }
        }
        if( JSON.stringify( object ) === JSON.stringify( {} ) ) {
          this.deleteUser( username );
        }
      });
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

  // Puts # of messages divided over tickPeriod into a messageRate stat
  // Expects 'messages' to have been within tickPeriod
  async calculateMessageRate( messages ) {
    const key = "messageRate";
    await this.calculateMessageCount( messages );

    // Sadly, setStatValueAll() cannot pass a 'this' before it is called
    this.userStats.forEach( (_, username) => {
      const count = this.getStatValue( username, "messageCount" );
      // The user might have existed from earlier, but doesn't have messageCount, or messageCount is 0
      if( count ) {
        this.setStatValue( username, key, count / this.tickPeriod );
      } else {
        this.setStatValue( username, key, 0 );
      }
    });
  }

  // Although the name implies derivation, since we're dealing with non-continuous,
  // discrete values, it's just an average of messageRates over its histogram period
  // Stores this in a stat called messageRateDerivative
  calculateMessageRateDerivative () {
    const key = "messageRateDerivative";
    this.userStats.forEach( (_, username) => {
      const messageRate = this.getStat( username, "messageRate" );
      if( messageRate && messageRate.values && messageRate.values.length > 0) {
        this.setStatValueAll( key, messageRate.values.reduce((a, b) => a + b) / messageRate.histogramSize );
      } else {
        this.setStatValueAll( key );
      }
    });
  }
}

export { UserStats };
