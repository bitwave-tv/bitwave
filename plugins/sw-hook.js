// Created by xander on 2/6/2020

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then( async ( registrations ) => {
      for ( const worker of registrations ) {
        console.log( 'Service worker:', worker );

        const cacheKeys = await caches.keys();
        if ( cacheKeys.includes( 'bitwave-images' ) ) {
          console.log( `deleting old images` );
          try {
            await caches.delete('bitwave-images');
            await caches.delete('bitwave-images-v1');
            await caches.delete('bitwave-images-v2');
          } catch ( error ) {
            console.error( error.message );
          }
        }
      }
    })
    .catch( error => console.warn( `service worker hook failed`, error ) );
}
