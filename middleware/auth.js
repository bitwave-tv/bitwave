
// If the user is not authenticated redirect to login page

export default function ({ redirect, store }) {
  console.log('Middleware(auth): Checking if logged in.');

  if (!store.state.auth) {
    console.log('Middleware(auth): Not logged in - redirecting.');
    return redirect('/login');
  } else {
    console.log('Middleware(auth): Logged in.');
  }
}
