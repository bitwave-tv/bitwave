// General utility functions that have been factored out of code

const export_obj = {
  // TODO: shorten name?
  normalizedCompare( a, b ) {
    // first line of checks unnecessary with typescript
    return a && b && a.toLowerCase && b.toLowerCase
      && a.toLowerCase() === b.toLowerCase();
  }
};

export default async ( _, inject ) => {
  inject( 'utils', export_obj );
}
