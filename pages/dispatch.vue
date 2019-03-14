<template>
<div>
	<v-layout>
		<v-flex xs12>
			<v-card class="mb-2">
				<v-card-title>
					<h3>Dispatch's LiveStream</h3>
				</v-card-title>
			  </v-card>
		</v-flex>
	</v-layout>

  <v-layout
    row
    justify-center
    align-start
  >

    <v-flex
      xs12
      sm8
      md10
    >

	  <v-card class="mb-4">
		<video playsinline id="myPlayer" class="video-js vjs-default-skin" width="100%" controls autoplay muted preload="auto" data-setup='{ "aspectRatio":"16:9" }'>
		  <source src="https://bitwave.tv/stream/dispatch.m3u8" type="application/x-mpegURL">
		</video>
	  </v-card>
	  
    </v-flex>
	
	<v-flex
      xs12
	  sm4
	  md2
	>
		<v-card class="">
			<v-card-title>
				<h3>Dispatch's LiveStream</h3>
			</v-card-title>
			<v-card-text>
				<p>Eventually this is where chat will show up :)</p>
			</v-card-text>
		</v-card>
	</v-flex>
	
  </v-layout>
</div>
</template>

<script>
// if (process.browser) window.videojs = require('video.js');
import videojs from 'video.js';

export default {
  components: {
  },
  
  data() {
	return {
		player: null,
		initialized: false,
		streams: {
			hls: 'https://bitwave.tv/stream/dispatch.m3u8',
		},
	}
  },
	
    computed: {
      
    },
	
	methods: {
		playerInitialize(){ 
			this.player = videojs('myPlayer');
			this.initialized = true;
		},
		playerDispose(){ 
			this.player.dispose(); 
		},
	},
  
    mounted() {
		// if (process.browser) window.videojs = require('video.js');
		this.playerInitialize();
		
		// window.playerEvents = this;
		console.log('this is current player instance object:', this.player);
    },
	
	beforeDestroy() { 
		this.playerDispose(); 
	},
}
</script>
