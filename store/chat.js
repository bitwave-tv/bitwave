

export const state = () => ({
  room: '',
  global: true,
  timestamps: true,

  viewerList: [{name: 'NONE'}],
  roomViewerList: {},
});


export const getters = {
  viewerCount ( state ) {
    return state.viewerList.length;
  },
};


export const mutations = {
  SET_ROOM ( state, data ) {
    state.room = data;
  },

  SET_TIMESTAMPS ( state, data ) {
    state.timestamps = !!data;
    localStorage.setItem( 'showtimestamps', !!data );
  },

  SET_MODE_GLOBAL ( state, data ) {
    state.global = !!data;
    localStorage.setItem( 'global', !!data );
  },

  SET_VIEWERLIST ( state, data ) {
    state.viewerList = [ ...data ];
  },

  SET_ROOM_VIEWERLIST ( state, data ) {
    state.roomViewerList = { ...data };
  },
};


export const actions = {
  CONNECT ({ dispatch, commit, state }, data) {
    commit('SET_ROOM', data);
  },

  UPDATE_VIEWERLIST ({ dispatch, commit, state }, data) {

    // Create list of unique viewers in each channel
    const roomViewerList = data.reduce( (accumulator, user) => {
      let username = user.username;
      let channel  = user.page ? user.page.watch || user.page : 'global' ;

      if ( !channel ) return accumulator;
      if ( typeof(channel) === 'string' ) channel = channel.toLowerCase();

      if (username) username = username.toLowerCase();

      if ( channel in accumulator ) {
        if ( username in accumulator[channel] ) {
          accumulator[channel][username].push(user);
        } else {
          accumulator[channel][username] = [ user ];
          accumulator[channel].total++;
        }
      } else {
        accumulator[channel] = {};
        accumulator[channel][username] = [ user ];
        accumulator[channel].total = 1;
      }
      return accumulator;
    }, {});
    commit('SET_ROOM_VIEWERLIST', roomViewerList);


    // Create unique list of users globally
    const key = 'username';
    const viewerList = data.reduce( (accumulator, current) => {
      if (!accumulator.find( obj => obj[key] === current[key] )) accumulator.push(current);
      return accumulator;
    }, []);
    commit('SET_VIEWERLIST', viewerList);

  },
};
