
// If the user is not authenticated redirect to login page

import { VStore } from '@/store';

export default function ( { redirect, store, route } ) {
  console.log( 'Middleware[auth]: Checking if logged in...' );
  console.log(route);

  if ( !store.state[VStore.$states.auth] ) {
    console.log( 'Middleware[auth]: User is not logged in - redirecting...' );
    return redirect( `/login?redirect=${route.path}` );
  } else {
    console.log( 'Middleware[auth]: User is logged in.' );
  }
}
