<template>
  <v-app
    :dark="dark"
  >
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      stateless
      fixed
      app
    >
      <v-list>
        <v-list-tile
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title" />
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      width="375px"
      clipped
      fixed
      flat
      app
    >

      <v-layout
        column
        fill-height
      >

        <v-layout
          column
          py-1
        >
          <v-flex class="title text-xs-center py-2">
            Live Chat
          </v-flex>

          <v-flex class="subheading text-xs-center red--text mb-2">
            <v-icon small color="red" class="px-1">warning</v-icon>
            WORK IN PROGRESS
            <v-icon small color="red" class="px-1">warning</v-icon>
          </v-flex>

        </v-layout>

        <v-divider/>

        <v-layout
          column
          fill-height
        >

          <v-flex>

            <v-layout
              column
              fill-height
              justify-end
            >
              <v-spacer fill-height></v-spacer>

              <v-flex
                shrink
              >
                <v-layout
                  row
                  my-3
                  px-3
                >
                  <v-list-tile-avatar>
                    <v-icon :class="['orange lighten-1 white--text']">person</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      ANON
                    </v-list-tile-sub-title>
                    This is a troll friendly chat.
                  </v-list-tile-content>
                </v-layout>
              </v-flex>

              <v-flex
                shrink
              >
                <v-layout
                  row
                  my-3
                  px-3
                >
                  <v-list-tile-avatar>
                    <img src="https://www.gravatar.com/avatar/4c016fba937df454004cf4c2ac5aef80?d=identicon" alt="Dispatch">
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      Murderder
                    </v-list-tile-sub-title>
                    This is an example message.
                  </v-list-tile-content>
                </v-layout>
              </v-flex>

              <v-flex
                shrink
              >
                <v-layout
                  row
                  my-3
                  px-3
                >
                  <v-list-tile-avatar>
                    <img src="https://www.gravatar.com/avatar/b88fd66ccef2d2ebbc343bfb08fb2efb" alt="Dispatch">
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      Dispatch
                    </v-list-tile-sub-title>
                    This is an example message which is supposed to be a multiline comment to test to see
                    if the interface can handle very long comments that go across multiple lines and
                    therefore can overflow or stretch or grow or whatever.
                  </v-list-tile-content>
                </v-layout>
              </v-flex>

            </v-layout>

          </v-flex>

        </v-layout>

        <v-flex>
          <v-layout
            row
            justify-center
          >
            <v-flex
              xs11
            >
              <v-text-field
                v-model="message2"
                outline
                label="Chat"
                clearable
                append-outer-icon="message"
                @click:append-outer=""
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-flex>

      </v-layout>

    </v-navigation-drawer>

    <v-toolbar
      :clipped-left="clipped"
      clipped-right
      dark
      dense
      fixed
      app
    >
      <v-toolbar-side-icon @click="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>{{ `chevron_${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>web</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="dark = !dark"
      >
        <v-icon>brightness_medium</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>menu</v-icon>
      </v-btn>
    </v-toolbar>

    <v-content>
      <nuxt />
    </v-content>


    <v-footer
      v-if="false"
      :fixed="fixed"
      class="px-2"
      app
    >
      <span>BitWave TV &copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
  export default {
    data() {
      return {
        clipped: true,
        drawer: true,
        fixed: false,
        dark: true,
        items: [
          {
            icon: 'home',
            title: 'Welcome',
            to: '/',
          },
          {
            icon: 'apps',
            title: 'Inspire',
            to: '/inspire',
          },
          {
            icon: 'ondemand_video',
            title: 'Dispatch',
            to: '/dispatch',
          },
          {
            icon: 'ondemand_video',
            title: 'Murderder',
            to: '/murderder',
          },
        ],
        miniVariant: true,
        right: true,
        rightDrawer: true,
        title: 'BitWave.tv',
      }
    }
  }
</script>
