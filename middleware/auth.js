
// If the user is not authenticated redirect to login page

import { VStore } from '@/store';

export default function ( { redirect, store } ) {
  console.log( 'Middleware[auth]: Checking if logged in...' );

  if ( !store.state[VStore.$states.auth] ) {
    console.log( 'Middleware[auth]: User is not logged in - redirecting...' );
    return redirect( '/login' );
  } else {
    console.log( 'Middleware[auth]: User is logged in.' );
  }
}
