// Created by xander on 2/16/2020


import { Chat } from '@/store/chat';

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
      const choice = await this.deferredPrompt.prompt();
      this.onUserChoice( choice );
    }
  }


  async onUserChoice ( choice ) {
    console.log( choice );
    await this.promptUser();
  }

}

export const pwaPrompt = new PWAPrompt();


export default async ( { app, commit } ) => {
  // only run client side
  if ( process.client ) {

    const onBeforeInstallPrompt = async ( event ) => {
      event.preventDefault();
      commit ( `${Chat.namespace}/${Chat.$mutations.setPwaPrompt}`, event );
      await pwaPrompt.onBeforeInstallPrompt( event );
    };

    window.addEventListener( 'beforeinstallprompt', onBeforeInstallPrompt  );

  }
};
