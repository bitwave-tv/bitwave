// Created by xander on 2/16/2020


import { VStore } from '@/store';

class PWAPrompt {

  constructor () {
    this.deferredPrompt = null;
  }


  async onBeforeInstallPrompt ( event ) {
    console.log( `PWA Install Prompt:`, event );
    this.deferredPrompt = event;

    /*if ( window.$nuxt.$route.path !== '/' ) {
      await event.prompt();
      const choice = await event.prompt();
      this.onUserChoice( choice );
    }*/

  }


  async promptUser () {
    if ( this.deferredPrompt ) {

      console.log(this.deferredPrompt );
      await this.deferredPrompt.prompt();
      const userAction = await this.deferredPrompt.userChoice;

      this.onUserChoice( userAction );
    }
  }


  onUserChoice ( choice ) {
    console.log( `User Chooice:`, choice );
  }

}

export const pwaPrompt = new PWAPrompt();


export default async ( { store } ) => {
  // only run client side
  if ( process.client ) {
    if ( process.env.APP_DEBUG ) console.log( `Listening for PWA prompt...` );

    const onBeforeInstallPrompt = async ( event ) => {
      console.log( `Prompt intercepted`, event );

      event.preventDefault();
      store.commit ( `${VStore.$mutations.setPwaPrompt}`, event );
      await pwaPrompt.onBeforeInstallPrompt( event );
    };

    window.addEventListener( 'beforeinstallprompt', onBeforeInstallPrompt  );

  }
};
