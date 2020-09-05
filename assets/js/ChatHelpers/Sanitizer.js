// Created by xander on 1/2/2020

// TODO: find and replace _ to # to use private methods when available in babel
//  track: https://github.com/babel/babel/issues/10752

// simple word filters for TTS
const filters = [
  {
    pattern: /n+[aei]+g+[aeiou]+r*/i,
    clean: 'funny word',
  },
  {
    pattern: /f+[aeiou]+g+[aeiou]+t+/i,
    clean: 'muddah',
  },
  {
    pattern: /f+[ae]+g+/i,
    clean: 'faddah',
  },
];

class Sanitizer {
  filters;

  constructor ( filterArray ) {
    this.filters = filterArray || filters;
  }

  _filter ( message ) {
    let clean = message;
    for ( let i = this.filters.length - 1; i >= 0; i-- ) {
      clean = clean.replace( this.filters[i].pattern, this.filters[i].clean );
    }
    return clean;
  }

  _stripUnicode ( message ) {
    return message.replace(/[\ud800-\udfff]/g, '');
  }

  sanitize ( message ) {
    let clean = this._stripUnicode( message );
    return this._filter( clean );
  }

  // Fixes escaped HTML characters
  _unescapeHtml ( unsafe ) {
    return unsafe
      .replace( /&lt;/g,   `<` )
      .replace( /&gt;/g,   `>` )
      .replace( /&quot;/g, `"` )
      .replace( /&#39;/g,  `'` )
      .replace( /&amp;/g,  `&` )
  }

  stripHTML ( message ) {
    return this
      ._unescapeHtml( message ) // Unescape string
      .replace( /<\/?[^>]*>/g, '' ) // Remove html tags
      .replace( /((https?:\/\/)|(www\.))[^\s]+/gi, '' ) // Remove Links
  }

}


const sanitizer = new Sanitizer();

export const sanitize  = message => sanitizer.sanitize( message );
export const stripHTML = message => sanitizer.stripHTML( message );
