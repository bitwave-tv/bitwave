import socketio from 'socket.io-client'


const socketOptions = { transports: [ 'websocket' ] };

class BitwaveSocket {
  constructor(  ) {
    this.socket = null;
    this.connected = false;
  }

  connect ( server ) {
    this.socket = socketio( server, socketOptions );
    this.socket.on( 'connect', () => this.connected = true );
    this.socket.on( 'disconnect', () => this.connected = false );
  }

  on ( event, callback ) {
    this.socket.on( event, callback );
  }

  async auth ( user ) {
    if ( !this.connected ) {
      console.error( `Chat socket is not connected!` );
      return;
    }

    await this.socket.emit( 'new user', user );
  }

}


export default async ( { app, store }, inject ) => {
  const bwSocket = new BitwaveSocket();

  inject( 'socket', bwSocket );
}
