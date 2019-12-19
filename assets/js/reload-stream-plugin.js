// Created by xander on 12/18/2019
// Creates a button for Video.js player that reloads the current source

import videojs from 'video.js';

const VideoJsButton = videojs.getComponent('Button');
const defaults = {}; // Default options for the plugin.
const placeAfter = 'CustomControlSpacer'; // PictureInPictureToggle

/**
 * Extend vjs button class for reload button.
 */
class ReloadButton extends VideoJsButton {
  constructor ( player ) {
    super( player, { title: player.localize('Reload') } );
    this.controlText('Reload Stream');
    this.listeners = new Map();
  }

  buildCSSClass () {
    return `vjs-reload-stream-plugin vjs-ended vjs-play-control ${super.buildCSSClass()}`;
  }

  handleClick ( event ) {
    this.dispatch( 'onclick', event );
  }

  onClick ( callback ) {
    const eventName = 'onclick';
    this.listeners.has( eventName ) || this.listeners.set( eventName, [] );
    this.listeners.get( eventName ).push( callback );
  }

  dispatch ( eventName, ...args ) {
    let success = false;
    if ( this.listeners.has( eventName ) ) {
      const callbacks = this.listeners.get( eventName );
      if ( callbacks.length ) {
        callbacks.forEach( callback => callback(...args) )
      }
      success = true;
    }
    return success;
  }
}

/**
 * Adds a reload stream button to video.js player
 */
class ReloadStreamPlugin {
  constructor ( player, options ) {
    this.player = player;
    this.config = options;

    // If there is reloadPlayer plugin then continue.
    if ( this.player.bitwaveReloader ) {
      this.createButton(); // Create the reload button.
    }
  }

  createButton () {
    const player = this.player;

    this._reloadButton = new ReloadButton( player );
    this._reloadButton.onClick( event => this.onClick( event ) );

    const controlBar = player.controlBar;
    const placementIndex = this.config.placementIndex || controlBar.children().findIndex( button => button.name() === placeAfter ) + 1;
    const concreteButtonInstance = controlBar.addChild( this._reloadButton, { componentClass: 'reloadPlayer' }, placementIndex );
  }

  onClick ( event ) {
    const player = this.player;
    const { src, type } = player.currentSource();
    player.src({ src, type });
  }
}

const onPlayerReady = ( player, options ) => {
  player.addClass( 'vjs-reload-stream-plugin' );
  player.bitwaveReloader = new ReloadStreamPlugin( player, options );
};

// In the plugin function, the value of `this` is a video.js `Player` instance
const bitwaveReloader = function ( options ) {
  this.ready( () => {
    onPlayerReady( this, videojs.mergeOptions( defaults, options ) );
  });
};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;

registerPlugin( 'bitwaveReloader', bitwaveReloader ); // Register the plugin with video.js.

bitwaveReloader.VERSION = '0.1.0';

export default bitwaveReloader;
