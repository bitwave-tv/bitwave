
// If the user is authenticated redirect to profile page

import { VStore } from '@/store';

export default function ( { store, redirect } ) {
  console.log( 'Middleware[not-auth]: Checking if logged in already.' );

  if ( store.state[VStore.$states.auth] ) {
    console.log( 'Middleware[not-auth]: Logged in - redirecting.' );
    return redirect( '/profile' );
  } else {
    console.log( 'Middleware[not-auth]: Not Logged in.' );
  }
}
