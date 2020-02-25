// Created by xander on 2/25/2020

export default async ( { $axios } ) => {

  // Timeout to prevent SSR from locking up
  // const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

  // Axios wrapper to abort on timeout when server hangs
  $axios.getSSR = async ( url, options = {} ) => {
    if ( options && options.hasOwnProperty( 'timeout' ) && options.timeout > 0 ) {
      const abort = $axios.CancelToken.source();
      const id = setTimeout(
        () => abort.cancel( `Canceled Request! Timeout of ${ options.timeout }ms.` ),
        options.timeout
      );
      const response = await $axios.get( url, { cancelToken: abort.token, ...options } );
      clearTimeout( id );
      return response;
    } else {
      return await $axios.get( url, { ...options } );
    }
  };

}
