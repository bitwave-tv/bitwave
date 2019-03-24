
// If the user is authenticated redirect to home page

export default function ({ store, redirect }) {
  console.log('checking if NOT logged in via middleware.');

  if (store.state.auth) {
    console.log('Logged in.');
    return redirect('/profile');
  }
}
