
// If the user is not authenticated redirect to login page

import { VStore } from '@/store';

export default function ( { redirect, store } ) {
  console.log( 'Middleware[admin]: Checking if user is an admin...' );

  const user = store.state[VStore.$states.user];
  const isAdmin = user && user.hasOwnProperty( 'role' ) && user.role === 'admin';

  if ( !isAdmin ) {
    console.log( 'Middleware[admin]: DENIED: User is not an admin.' );
    return redirect( '/protected' );
  } else {
    console.log( 'Middleware[admin]: User is an admin.' );
  }
}
