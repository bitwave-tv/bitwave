/**
 * Takes in an array object of containing all cookie, name-value pairs
 *  and returns a token, or null, on bad parse.
 */
export const parseCookiesForAuth = ( cookies ) => {
  return cookies?.auth ?? null;
};
