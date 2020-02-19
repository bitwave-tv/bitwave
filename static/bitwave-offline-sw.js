// Created by xander on 2/16/2020

// importScripts( 'sw.js' );

// Define a custom route
/*workbox.routing.registerRoute(
new RegExp('/.*' ),

  async ( request ) => {
    const strategy  = new workbox.strategies.NetworkFirst ({});
    try {
      const response = await strategy.handle( request );
      if ( !response ) {
        return caches.match('/');
      }
      if ( response ) {
        return caches.match('/');
      }
    } catch ( error ) {
      console.error ( error );
      return caches.match('/');
    }
  },

  'GET',
);*/


// -----------------------------------------


// Detect 4XX / 5XX server errors so we can fallback to the cache
// see: https://github.com/GoogleChrome/workbox/issues/2084#issuecomment-506457979
// documentation: https://developers.google.com/web/tools/workbox/guides/using-plugins

/*const serverFailure = {
  fetchDidSucceed: async ({ request, response }) => {
    // response.ok means there was a 2xx response code.
    if ( response.ok ) return response;

    // Throwing here should make it roughly equivalent to a network failure.
    throw new Error(`${response.status} ${response.statusText}`);
  },
};

// Create strategy
const offlineStrategy = new workbox.strategies.NetworkFirst({ plugins: [ serverFailure ] });

// Register router
workbox.routing.registerRoute( '/.*', offlineStrategy, 'GET' );*/

console.log('Starting bitwave-offline service worker!');
