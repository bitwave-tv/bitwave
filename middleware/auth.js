
// If the user is not authenticated redirect to login page

export default function ({ redirect, store }) {
  console.log('checking if logged in via middleware.');

  if (!store.state.auth) {
    console.log('Not logged in.');
    return redirect('/login');
  }
}
