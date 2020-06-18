
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

    this.calculate = {
      messageCount: {
        key: "messageCount",

        // Puts # of messages into a messageCount stat
        // Expects 'messages' to have happened within a single period
        // Creates entries for usernames that don't have one
        everybody: async messages => {
          this.stat.value.setAll( this.calculate.messageCount.key );
          for( const m of messages ) {
            await this.stat.value.increment( m.username, this.calculate.messageCount.key );
          }
        },

        // Calculates the total amount of messages
        // Stores this into stat messageCount for username this.ALL_USER ("all")
        total: messages => {
          this.stat.value.set( this.ALL_USER, this.calculate.messageCount.key, messages.length );
        },
      },

      messageRate: {
        key: "messageRate",

        // Puts user's messageCount value divided over tickPeriod into a messageRate stat
        // Sets 0 for messageRate if messageCount is falsy
        user: username => {
          const user = this.getUser( username );
          if( user ) {
            const count = this.stat.value.get( username, "messageCount" );
            if( count ) {
              this.stat.value.set( username, this.calculate.messageRate.key, count / this.tickPeriod );
            } else {
              this.stat.value.set( username, this.calculate.messageRate.key, 0 );
            }
          }
        },

        // Puts # of messages divided over tickPeriod into a messageRate stat
        // Expects 'messages' to have been within tickPeriod
        everybody: async messages => {
          await this.calculate.messageCount.everybody( messages );

          // Sadly, setStatValueAll() cannot pass a 'this' before it is called
          this.userStats.forEach( (_, username) => {
            this.calculate.messageRate.user( username );
          });
        },

        // Calculates the rate of posting for all messages
        // Stores this into stat messageRate for username this.ALL_USER ("all")
        total: async messages => {
          await this.calculate.messageCount.total( messages );
          this.calculate.messageRate.user( this.ALL_USER );
        },
      },

      messageRateDerivative: {
        key: "messageRateDerivative",

        // Calculates the rate of messageRate for a single user
        user: username => {
          const messageRate = this.stat.get( username, "messageRate" );
          if( messageRate && messageRate.values && messageRate.values.length > 0 ) {
            this.stat.value.setAll( this.calculate.messageRateDerivative.key, messageRate.values.reduce((a, b) => a + b) / messageRate.histogramSize );
          } else {
            this.stat.value.setAll( this.calculate.messageRateDerivative.key );
          }
        },

        // Although the name implies derivation, since we're dealing with non-continuous,
        // discrete values, it's just an average of messageRates over its histogram period
        // Stores this in a stat called messageRateDerivative
        everybody: () => {
          this.userStats.forEach( (_, username) => {
            this.calculate.messageRateDerivative.user( username );
          });
        },

        // Calculates the rate of change of the rate of posting
        // Stores this into stat messageRateDerivative for username this.ALL_USER ("all")
        total: () => this.calculate.messageRateDerivative.user( this.ALL_USER ),
      },

      spamminess: {
        key: "spamminess",
        everybody: messages => {
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
            this.stat.value.offset( m.username, this.calculate.spamminess.key, messageCount.get( m.message ) ?? 0 );
          }
        },
        total: messages => {
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
          this.stat.value.set( this.ALL_USER, this.calculate.spamminess.key, sorted ?? 1 );
        }
      },

      niceness: {
        key: "niceness",
        user: ( username, sensitivity ) => {
          const messageCount = this.stat.value.get( username, "messageCount" ) ?? 0;
          const messageRate = this.stat.value.get( username, "messageRate" ) ?? 0;
          const spamminess = this.stat.value.get( username, "spamminess" ) ?? 0;

          this.stat.value.set( username, this.calculate.niceness.key, ( messageCount * spamminess * sensitivity ) + messageRate );
        }
      }
    };

    this.stat = {
      // Sets the stat object for 'username'
      // Will create a new user if it doesn't exist
      // Will overwrite any existing stat object. For setting a value, see stat.value.set()
      set: ( username, key, statObj ) => {
        let user = this.getUser( username );
        if( !user ) {
          this.addUser( username );
          user = this.getUser( username );
        }

        this.statNames.add( key );
        user.set( key, statObj );
      },

      // Sets the stat for 'key' to be 'statObj' for all existing users
      // Will overwrite any existing stat object. For setting a value, see stat.value.setAll()
      setAll: ( key, statObj ) => {
        this.statNames.add( key );
        this.userStats.forEach( stats => {
          stats.set( key, statObj );
        });
      },

      // Gets the user's stat object for key
      // For getting a stat value, see stat.value.get()
      get: ( username, key ) => {
        const user = this.getUser( username );
        if( user ) {
          return user.get( key );
        }
      },

      value: {
        // Sets the stat value for 'username'
        // Will create a new user if it doesn't exist
        // Will create a new stat, if one doesn't exist
        set: ( username, key, value = 0 ) => {
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
        },

        // Sets the stat value for 'key' to be 'value' for all existing users
        // Will create a new stat, if the user doesn't have one
        setAll: ( key, value = 0 ) => {
          this.userStats.forEach( (stats, username) => {
            this.stat.value.set( username, key, value );
          });
        },

        // Gets the value of a stat for a user
        get: ( username, key ) => {
          const user = this.getUser( username );
          if( user ) {
            const stat = user.get( key );
            if( key ) {
              return stat.value;
            }
          }
        },

        // Sets the value of a stat corresponding to key, belonging to a user to be oldValue + offset
        // Will create a new stat, if one doesn't exist
        // Will create a new user, if one doesn't exist
        offset: ( username, key, offset ) => {
          const value = this.stat.value.get( username, key );
          if( value !== undefined && value != null ) {
            this.stat.value.set( username, key, value + offset );
          } else {
            this.stat.value.set( username, key, offset );
          }
        },

        // Increments the value of a stat corresponding to key, belonging to a user
        // Will create a new stat, if one doesn't exist
        // Will create a new user, if one doesn't exist
        increment: ( username, key ) => {
          this.stat.value.offset( username, key, 1 );
        },

        // Decrements the value of a stat corresponding to key, belonging to a user
        // Will create a new stat, if one doesn't exist
        // Will create a new user, if one doesn't exist
        decrement: ( username, key ) => {
          this.stat.value.offset( username, key, -1 );
        },
      },
    };
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
}

export { UserStats };
