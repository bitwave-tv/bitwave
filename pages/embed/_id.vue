<template>
    <div>

      <!-- Countdown to Live -->
      <div
        v-if="showCountdown"
        style="position:absolute;"
      >
        <div
          style="position: relative; top: 1rem; left: 1rem; z-index: 10; opacity: 75%;"
        >
          <countdown
            :timestamp="scheduled"
            :key="scheduled"
          />
        </div>
      </div>

      <stream-player
        :poster="posterCacheBusted"
        :source="url"
        :type="type"
        :autoplay="autoplay"
        :class="{ 'odysee-skin': isOdysee }"
        :odysee="isOdysee"
      />
      <!-- Footer -->
      <v-sheet
        class="pa-2"
        color="grey darken-4"
        tile
      >
        <div class="overline">Powered by Bitwave Media</div>
      </v-sheet>
    </div>
</template>

<script>
  import StreamPlayer from '@/components/Channel/StreamPlayer';

  const ODYSEE_VID = 'https://cdn.bitwave.tv/static/odysee-intro.mp4';

  export default {
    name: 'embed-id',

    layout: 'overlay',

    components: { StreamPlayer },

    data () {
      return {
        name: null,
        avatar: null,
        title: null,
        description: null,
        poster: null,
        live: null,
        nsfw: null,
        owner: null,
        url: null,
        type: null,
        scheduled: null,
      };
    },

    methods: {

    },

    computed: {
      autoplay () {
        if ( !this.live ) return false;
        return this.$route.query.autoplay === 'true' ||
          this.$route.query.autoplay === '1' ||
          false;
      },

      overlayId () {
        return this.$route.params.id;
      },

      isOdysee () {
        const skin = this.$route.query.skin || this.$route.query.s;
        return skin && skin.toLowerCase() === 'odysee';
      },

      posterCacheBusted () {
        if ( this.live ) {
          const coeff = 1000 * 60; // Cache bust poster every minute
          const timestamp = Math.round( Date.now() / coeff ) * coeff;
          return `${this.poster}?${timestamp}`;
        } else {
          return this.poster;
        }
      },


      // TODO: hookup data to detect when the last stream was
      showCountdown () {
        if ( this.live ) return false;
        if ( !this.scheduled ) return false;
        // if ( !this.timestamp ) return false;

        // Do not show countdown if last streamed timestamp is after scheduled
        // if ( this.timestamp > this.scheduled ) return false;

        return true;
      },
    },

    async asyncData ( { $axios, params, query } ) {
      const user = params.id;
      const skin = query.skin || query.s;
      const isOdysee = skin && skin.toLowerCase() === 'odysee';

      // adjust default image according to skin
      const errorPoster = isOdysee
        ? 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg'
        : 'https://cdn.bitwave.tv/static/img/odysee-banner-live-mockup-2.jpg';

      // Timeout to prevent SSR from locking up
      const timeout = process.server
        ? process.env.SSR_TIMEOUT
        : 0;

      try {
        const { data } = await $axios.getSSR( `https://api.bitwave.tv/api/channel/${user}`, { timeout } );

        const name   = data.name;
        const avatar = data.avatar;
        let   poster = data.poster || errorPoster;
        const title  = data.title ;
        const desc   = data.description;
        const live   = data.live;
        const nsfw   = data.nsfw;
        const owner  = data.owner;
        const scheduled = data.scheduled || false;
        let   type   = data.type   || `application/x-mpegURL`; // DASH -> application/dash+xml
        let   url    = data.url;

        const thumb  = data.thumbnail;
        if ( data.thumbnail ) poster = live ? thumb : poster;

        if ( !live ) {
          // Force override offline bump video for odysee
          if ( isOdysee ) {
            url = ODYSEE_VID;
            type = 'video/mp4';
          } else {
            const { data } = await $axios.getSSR( 'https://api.bitwave.tv/api/bump', { timeout } );
            url = data.url;
            type = 'video/mp4';
          }
        }

        return { name, avatar, title, description: desc, poster, live, nsfw, owner, url, type, scheduled };

      } catch ( error ) {
        console.log( `ERROR: Failed to find user ${user}: ${error.message}` );

        return {
          name   : '404 Error',
          avatar : 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
          poster : errorPoster,
          title  : 'Streamer not found',
          description : 'Invalid Stream',
          live   : false,
          nsfw   : false,
          url    : null,
          type   : null,
          scheduled : false,
        }
      }
    },

    mounted () {

    },
  };
</script>
