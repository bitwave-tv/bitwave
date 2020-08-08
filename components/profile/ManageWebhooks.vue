<template>
  <div>
    <div
      v-if="!webhooks || webhooks.length === 0"
      class="mb-3"
    >
      No webhooks have been created!
    </div>
    <div
      v-for="webhook in webhooks"
      class="d-flex align-center mb-3"
    >
      <v-text-field
        class="mr-2"
        solo-inverted
        hide-details
        :value="webhook.data.webhook"
        readonly
      />
      <v-btn
        color="red"
        @click="deleteWebhook( webhook.id )"
      ><v-icon>delete</v-icon></v-btn>
    </div>

    <div>
      <v-text-field
        placeholder="Discord Webhook URL"
        class="mb-3"
        solo-inverted
        hide-details
        v-model="newWebhook"
      />
      <v-btn
        :loading="loading"
        color="primary"
        @click="createOnLiveWebhook"
      >Add Webhook</v-btn>
      <v-btn
        :disabled="!webhooks || webhooks.length === 0"
        :loading="testingWebhooks"
        color="success"
        @click="testWebhooks"
      >Test</v-btn>
    </div>
  </div>
</template>

<script>
  import { auth, db } from '@/plugins/firebase';
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'ManageWebhooks',

    data() {
      return {
        webhooks: [],
        newWebhook: '',
        loading: false,
        testingWebhooks: false,
      };
    },

    methods: {
      async getWebhooks () {
        const result = await db
          .collection('webhooks')
          .where( 'owner', '==', this.uid )
          .limit( 10 )
          .get();

        if ( result.empty ) {
          this.webhooks = [];
          return;
        }

        this.webhooks = result.docs.map( doc => {
          const data = doc.data();
          const id = doc.id;
          return {
            id: id,
            data: data,
          }
        });
      },

      async createOnLiveWebhook () {
        this.loading = true;
        await this.createWebhook( this.newWebhook, 'stream-start' );
        this.newWebhook = '';
        await this.getWebhooks();
        this.loading = false;
      },

      async createWebhook ( webhook, event ) {
        await db
          .collection('webhooks')
          .add({
            _username: this.username.toLowerCase(),
            event: event,
            owner: this.uid,
            webhook: webhook,
          });
      },

      async deleteWebhook ( id ) {
        await db.collection( 'webhooks' ).doc( id ).delete();
        await this.getWebhooks();
      },

      async testWebhooks () {
        this.testingWebhooks = true;
        const endpoint = `https://api.bitwave.tv/v1/webhooks/test`;
        const payload = { user: this.username };
        try {
          await this.$axios.post(
            endpoint,
            payload,
          );
          this.$toast.success( `Notifications sent!`, { icon: 'done', duration: 2000, position: 'top-center' } );
        } catch ( error ) {
          this.$toast.error( error.message, { icon: 'error', duration: 2000, position: 'top-center' } );
        }
        this.testingWebhooks = false;
      },
    },

    computed: {
      ...mapGetters({
        uid: VStore.$getters.getUID,
        username : VStore.$getters.getUsername,
      }),
    },

    async mounted() {
      await this.getWebhooks();
    },
  };
</script>
