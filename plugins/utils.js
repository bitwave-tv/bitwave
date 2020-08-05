// General utility functions that have been factored out of code

const export_obj = {
  normalize( a ) {
    return a && a.toLowerCase && a.toLowerCase();
  },

  // TODO: shorten name?
  normalizedCompare( a, b ) {
    // first line of checks unnecessary with typescript
    return this.normalize( a ) === this.normalize( b );
  }
};

export default async ( _, inject ) => {
  inject( 'utils', export_obj );
}
