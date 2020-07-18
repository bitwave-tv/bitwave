<template>
  <div class="payment">

    <div class="body-2">
      Username colors appear sitewide in all stream chats.<br>
      Newly purchased colors will replace existing color.<br>
      Purchased colors will immediately apply to account.
    </div>

    <div class="body-2 mt-2">Preview:</div>

    <!-- Preview Name Color -->
    <v-card
      color="black"
      class="mb-4 mt-1 px-4 py-2 elevation-3"
    >
      <div>
        <span style="color: #757575;">[00:00]</span>
        <span style="color: #757575;">[L]</span>
        <span class="font-weight-bold" :style="{ color: color }">{{ user ? user.username : 'FailedToLoadUsername' }}</span>
      </div>
    </v-card>

    <!-- Select Color -->
    <v-color-picker
      v-model="selectedColor"
      mode="hexa"
      class="mt-4"
      width="100%"
      hide-canvas
      light
    />

    <!-- Purchase Color UI -->
    <div class="mt-4">
      <stripe-integration
        btn-text="Buy Now"
        :color="selectedColor"
        @loading="val => this.loading = val"
        @error="val => this.error = val"
        @success="val => this.success = val"
      />
    </div>

    <!-- Success / Error Messages -->
    <div class="mt-3">
      <v-alert
        :value="error"
        type="error"
        transition="fade-transition"
        class="mb-0"
      >
        {{ error.message }}
      </v-alert>
      <v-alert
        :value="success"
        type="success"
        transition="fade-transition"
        class="mb-0"
      >
        Thanks for your purchase!
      </v-alert>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'PurchaseColor',

    data() {
      return {
        loading: false,
        error: false,
        success: false,
        selectedColor: '#20EEEE',
        colors: [
          {
            text: 'red',
            value: '#f44336'
          },
          {
            text: 'pink',
            value: '#e91e63'
          },
          {
            text: 'orange',
            value: '#ff9800'
          },
          {
            text: 'yellow',
            value: '#f1c40f'
          },
          {
            text: 'green',
            value: '#4caf50'
          },
          {
            text: 'teal',
            value: '#009688'
          },
          {
            text: 'blue',
            value: '#2196f3'
          },
          {
            text: 'purple',
            value: '#673ab7'
          },
        ],
      };
    },

    methods: {

    },

    computed: {
      ...mapGetters({
        user: VStore.$getters.getUser,
        username: VStore.$getters.getUsername,
      }),

      color () {
        return !!this.selectedColor.value ? this.selectedColor.value : this.selectedColor;
      },
    },
  };
</script>

<style lang='scss'>

</style>
