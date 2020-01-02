// Created by xander on 1/2/2020

// TODO: find and replace _ to # to use private methods when available in babel
//  track: https://github.com/babel/babel/issues/10752

// Spam reduction for TTS
class AntiSpam {
  _history;

  threshold = 0.85;
  memorySize = 5;
  minimumMessageSize = 30;
  maxLength = 150;

  constructor ( config ) {
    if ( config ) {
      // Spam detection threshold
      this.threshold = config.threshold || 0.85;
      // How far back should we check for duplicates?
      this.memorySize = config.memorySize || 5;
      // Minimum message size to detect
      // This prevents rejecting short but common response
      this.minimumMessageSize = config.minimumMessageSize || 30;
      // Maximum amount of characters to check
      // We probably don't need to check the entire message if
      // the message is really long
      this.maxLength = config.maxLength || 150;
    }

    // - - - Internal variables - - -
    this._history = [];
  }

  _calcStringVariation ( s1, s2 ) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    let costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  _similarity ( s1, s2 ) {
    let longer = s1, shorter = s2;
    if ( s1.length < s2.length ) {
      longer = s2;
      shorter = s1;
    }
    const lg = longer.length;
    if ( lg === 0 ) return 1.0;
    return ( lg - this._calcStringVariation( longer, shorter ) ) / parseFloat( lg  );
  }

  _addMessage ( message ) {
    this._history.push( message );
    this._history = this._history.splice( -this.memorySize );
  }

  _isSimilar ( message ) {
    // Check array in reverse order since rapidly repeated messages
    // are more likely to be the more recent messages, and therefore
    // we can return earlier.
    for ( let i = this._history.length - 1; i >= 0; i-- ) {
      const s = this._similarity( message, this._history[i] );
      if ( s > this.threshold ) return true;
    }

    // Message is (probably) unique

    // Only add message to history if it is unique
    // This improves detection by preventing spam from filling
    // the entire history array
    this._addMessage( message );

    // Return false to indicate the message is (probably) unique
    return false;
  }

  check ( message ) {
    // Detect short messages
    if ( message.length < this.minimumMessageSize ) return false;

    // Reduce message size
    if ( message.length > this.maxLength ) message = message.substring( 0, this.maxLength );

    // Reduce message to just words
    message = message.replace(/\W/g, '');

    // Check for similarity
    return this._isSimilar( message );
  }
}


const antiSpam = new AntiSpam();

export const spamDetection = message => antiSpam.check( message );
