// Created by xander on 7/27/2020

import videojs from 'video.js';

const VideoJsComponent = videojs.getComponent('Component');

// Default options for the plugin.
const defaults = {
  size: 50,
  thickness: 7,
  svgSize: 100,
  animationDuration: '1.5s',
  spinnerColor: '#13a9fe',
  backgroundColor: 'rgba(43, 51, 63, 0.5)',
};


class TriSpinner extends VideoJsComponent {

  createEl () {
    const addCSS = s =>(d=>{d.head.appendChild(d.createElement("style")).innerHTML=s})(document);

    console.log( `trispinner options:`, this.options() );

    const size      = this.options().size;
    const svgSize   = this.options().svgSize;
    const thickness = this.options().thickness;

    addCSS(`
      .vjs-loading-tri-spinner {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        margin: -${size / 2}px 0 0 -${size / 2}px;
        opacity: 0.85;
        text-align: left;
        border: ${this.options().thickness}px solid ${this.options().backgroundColor};
        box-sizing: border-box;
        background-clip: padding-box;
        width: ${size}px;
        height: ${size}px;
        border-radius: ${size / 2}px;
        /*visibility: hidden;*/
      }

      .vjs-spinner-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
      }

      .vjs-spinner-container {
        width: ${size}px;
        height: ${size}px;
      }

      @keyframes animation {
        0% {
          stroke-dasharray: 1 98;
          stroke-dashoffset: -105;
        }
        50% {
          stroke-dasharray: 80 10;
          stroke-dashoffset: -160;
        }
        100% {
          stroke-dasharray: 1 98;
          stroke-dashoffset: -300;
        }
      }

      .vjs-spinner {
        transform-origin: center;
        animation-name: animation;
        animation-duration: ${this.options().animationDuration};
        animation-timing-function: cubic-bezier;
        animation-iteration-count: infinite;
      }

      .vjs-seeking .vjs-loading-spinner:before,
      .vjs-waiting .vjs-loading-spinner:before {
        display: none;
      }

      .vjs-seeking .vjs-loading-spinner:after,
      .vjs-waiting .vjs-loading-spinner:after {
        display: none;
      }
    `);

    /*const el = super.createEl('div', {
      className: 'vjs-loading-tri-spinner',
    });*/

    const el = this.player().loadingSpinner.el();

    const spinnerPlaceholder = document.createElement( 'div' );
    spinnerPlaceholder.classList.add( 'vjs-spinner-container' );

    el.appendChild(spinnerPlaceholder);

    const svg =
      `<svg viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="${this.options().spinnerColor}" />
          </filter>
        </defs>
        <circle
          class="vjs-spinner"
          style="fill:transparent;stroke:${this.options().spinnerColor};stroke-width:${thickness}px;stroke-linecap: round;filter:url(#shadow);" cx="${svgSize / 2}" cy="${svgSize / 2}" r="45"
        />
      </svg>`;

    spinnerPlaceholder.innerHTML = svg;

    console.log( el );

    return el;
  }

}


const onPlayerReady = ( player, options ) => {
  // We won't remove the existing spinner
  // We're just going to add to it
  // player.removeChild( player.loadingSpinner );

  const triSpinner = new TriSpinner( player, options );

  console.log( triSpinner );

  player.addChild( triSpinner );

  player.loadingSpinner = triSpinner;

  player.addClass( 'vjs-tri-spinner-plugin' );

  console.log( `Loaded trispinner!` );
};


// In the plugin function, the value of `this` is a video.js `Player` instance
const bitwaveTriSpinner = function ( options ) {
  this.ready( () => {
    console.log( `Loading trispinner!` );
    onPlayerReady( this, videojs.mergeOptions( defaults, options ) );
  });
};


// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;

registerPlugin( 'bitwaveTriSpinner', bitwaveTriSpinner ); // Register the plugin with video.js.

bitwaveTriSpinner.VERSION = '0.1.0';

export default bitwaveTriSpinner;

