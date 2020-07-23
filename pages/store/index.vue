<template>
  <v-container>
    <div>

      <div class="mb-3">
        <h3>Quick n Dirty Shop <span class="grey--text subtitle-1">(but the products should be clean)</span></h3>
        <hr class="grey" />
      </div>

      <v-row>
        <v-col cols="12" md="6">
        <v-card color="white black--text pa-2">
          <v-card-title>bitwave mask</v-card-title>
          <v-card-subtitle class="grey--text">The Chinese swear it's an N95 mask. At worst, it's better than nothing.</v-card-subtitle>

          <div class="d-flex mb-3">
            <!--<v-img src="https://cdn.bitwave.tv/static/img/bitwave_mask.jpg" width="50%" />-->
            <v-img src="https://cdn.bitwave.tv/static/img/bitwave_mask_box.jpg" width="50%" />
          </div>

          <div>

            <form action="https://www.paypal.com/cgi-bin/webscr" id="paypal-styling" method="post" target="_blank">
              <input type="hidden" name="cmd" value="_s-xclick">
              <input type="hidden" name="hosted_button_id" value="TKAX8MKF3SM7S">
              <input type="hidden" name="currency_code" value="USD">

              <div class="d-flex flex-column justify-space-between align-center">
                <div>
                  <input type="hidden" name="on0" value="Quantity">
                  Quantity (click dropdown below to modify)
                </div>
                <div class="wrap my-3">
                  <div class="select">
                    <select class="select-text" name="os0">
                      <option value="1 Mask">1 Mask $6.00 USD</option>
                      <option value="2 Masks">2 Masks $10.00 USD</option>
                      <option value="3 Masks">3 Masks $12.00 USD</option>
                    </select>
                    <span class="select-highlight"></span>
                    <span class="select-bar"></span>
                  </div>
                </div>
                <v-btn color="primary" class="black--text" name="submit" type="submit">Pay Now</v-btn>
              </div>
              <!--<input type="image"
                     src="https://www.paypalobjects.com/en_US/i/btn/btn_paynow_LG.gif"
                     border="0"
                     name="submit"
                     alt="PayPal - The safer, easier way to pay online!"
              >-->
              <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
            </form>

          </div>
        </v-card>
        </v-col>
      </v-row>

    </div>
  </v-container>
</template>

<script>
  export default {
    name: 'store',

    head () {
      return {
        title: this.title,
        link: [
          { rel: 'canonical', href: `https://bitwave.tv/store` },
        ],
        meta: [
          { property: 'og:title',            hid: 'og:title',       content: this.title },
          { property: 'og:url',              hid: 'og:url',         content: `https://bitwave.tv/store` },
          { property: 'og:description',      hid: 'og:description', content: (this.description || '').substring( 0, 200 ) },
          { property: 'og:image',            hid: 'og:image',       content: this.image},
          { property: 'description',         hid: 'description',    content: (this.name || '').substring( 0, 200 ) },
          { property: 'twitter:card',        content: 'summary_large_image' },
          { property: 'twitter:site',        content: '@BitwaveTV' },
          { property: 'twitter:title',       content: ( this.title || '' ).substring( 0,  70 ) },
          { property: 'twitter:description', content: ( this.description  || '' ).substring( 0, 200 ) },
          { property: 'twitter:image',       content: this.image },
        ],
      }
    },

    data() {
      return {
        title: `Store - [bitwave.tv]`,
        description: 'Buy your bitwave.tv COVID-19 N95 masks here!',
        image: 'https://cdn.bitwave.tv/static/img/bitwave_mask.jpg',
      };
    },

    methods: {},

    computed: {},

    mounted() {

    },
  };
</script>

<style lang='scss' scoped>
  #paypal-styling {

    .wrap {

    }

    /* select starting stylings ------------------------------*/
    .select {
      font-family:
        'Roboto','Helvetica','Arial',sans-serif;
      position: relative;
      width: 350px;
    }

    .select-text {
      position: relative;
      font-family: inherit;
      background-color: transparent;
      width: 300px;
      padding: 10px 10px 10px 0;
      font-size: 18px;
      border-radius: 0;
      border: none;
      border-bottom: 1px solid rgba(0,0,0, 0.12);
    }

    /* Remove focus */
    .select-text:focus {
      outline: none;
      border-bottom: 1px solid rgba(0,0,0, 0);
    }

    /* Use custom arrow */
    .select .select-text {
      appearance: none;
      -webkit-appearance:none
    }

    .select:after {
      position: absolute;
      top: 18px;
      right: 10px;
      /* Styling the down arrow */
      width: 0;
      height: 0;
      padding: 0;
      content: '';
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid rgba(0, 0, 0, 0.12);
      pointer-events: none;
    }


    /* LABEL ======================================= */
    .select-label {
      color: rgba(0,0,0, 0.26);
      font-size: 18px;
      font-weight: normal;
      position: absolute;
      pointer-events: none;
      left: 0;
      top: 10px;
      transition: 0.2s ease all;
    }

    /* active state */
    .select-text:focus ~ .select-label, .select-text:valid ~ .select-label {
      color: #2F80ED;
      top: -20px;
      transition: 0.2s ease all;
      font-size: 14px;
    }

    /* BOTTOM BARS ================================= */
    .select-bar {
      position: relative;
      display: block;
      width: 350px;
    }

    .select-bar:before, .select-bar:after {
      content: '';
      height: 2px;
      width: 0;
      bottom: 1px;
      position: absolute;
      background: #2F80ED;
      transition: 0.2s ease all;
    }

    .select-bar:before {
      left: 50%;
    }

    .select-bar:after {
      right: 50%;
    }

    /* active state */
    .select-text:focus ~ .select-bar:before, .select-text:focus ~ .select-bar:after {
      width: 50%;
    }

    /* HIGHLIGHTER ================================== */
    .select-highlight {
      position: absolute;
      height: 60%;
      width: 100px;
      top: 25%;
      left: 0;
      pointer-events: none;
      opacity: 0.5;
    }
  }
</style>
