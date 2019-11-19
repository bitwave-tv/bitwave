
// If the user is not authenticated redirect to login page

export default function ({ redirect, store }) {
  console.log('Middleware(auth): Checking if logged in.');

  if (!store.state.auth) {
    console.log('Middleware(auth): User is not logged in - redirecting...');
    return redirect('/login');
  } else {
    console.log('Middleware(auth): User is logged in.');
  }
}
