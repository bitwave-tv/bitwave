<template>
    <div
      v-show="active"
      id="fireworks"
      :class="{
        darken: darken,
      }"
    >
      <canvas id="canvas">Your browser does not support the 'canvas' element. :(</canvas>
      <div
        class="hero"
        :class="{
          show: showHero
        }"
      >
        <div class="display-4 mb-5">Happy New Year!</div>
        <div class="display-3 font-weight-thin">from [bitwave.tv]</div>
      </div>
    </div>
</template>

<script>


  const fireworks = () => {
    // === CONFIGURATION ===

    // Base firework acceleration.
    // 1.0 causes fireworks to travel at a constant speed.
    // Higher number increases rate firework accelerates over time.
    const FIREWORK_ACCELERATION = 1.05;
    // Minimum firework brightness.
    const FIREWORK_BRIGHTNESS_MIN = 50;
    // Maximum firework brightness.
    const FIREWORK_BRIGHTNESS_MAX = 70;
    // Base speed of fireworks.
    const FIREWORK_SPEED = 5;
    // Base length of firework trails.
    const FIREWORK_TRAIL_LENGTH = 3;
    // Determine if target position indicator is enabled.
    const FIREWORK_TARGET_INDICATOR_ENABLED = false;

    // Minimum particle brightness.
    const PARTICLE_BRIGHTNESS_MIN = 50;
    // Maximum particle brightness.
    const PARTICLE_BRIGHTNESS_MAX = 80;
    // Base particle count per firework.
    const PARTICLE_COUNT = 100;
    // Minimum particle decay rate.
    const PARTICLE_DECAY_MIN = 0.015;
    // Maximum particle decay rate.
    const PARTICLE_DECAY_MAX = 0.03;
    // Base particle friction.
    // Slows the speed of particles over time.
    const PARTICLE_FRICTION = 0.95;
    // Base particle gravity.
    // How quickly particles move toward a downward trajectory.
    const PARTICLE_GRAVITY = 0.7;
    // Variance in particle coloration.
    const PARTICLE_HUE_VARIANCE = 20;
    // Base particle transparency.
    const PARTICLE_TRANSPARENCY = 1;
    // Minimum particle speed.
    const PARTICLE_SPEED_MIN = 1;
    // Maximum particle speed.
    const PARTICLE_SPEED_MAX = 10;
    // Base length of explosion particle trails.
    const PARTICLE_TRAIL_LENGTH = 5;

    // Alpha level that canvas cleanup iteration removes existing trails.
    // Lower value increases trail duration.
    const CANVAS_CLEANUP_ALPHA = 0.15;
    // Hue change per loop, used to rotate through different firework colors.
    const HUE_STEP_INCREASE = 0.5;

    // Minimum number of ticks per manual firework launch.
    const TICKS_PER_FIREWORK_MIN = 5;
    // Minimum number of ticks between each automatic firework launch.
    const TICKS_PER_FIREWORK_AUTOMATED_MIN = 20;
    // Maximum number of ticks between each automatic firework launch.
    const TICKS_PER_FIREWORK_AUTOMATED_MAX = 80;

    // === END CONFIGURATION ===

    // === LOCAL VARS ===

    let canvas = document.getElementById( 'canvas' );
    // Set canvas dimensions.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Set the context, 2d in this case.
    let context = canvas.getContext( '2d' );
    // Firework and particles collections.
    let fireworks = [], particles = [];
    // Mouse coordinates.
    let mouseX, mouseY;
    // Variable to check if mouse is down.
    let isMouseDown = false;
    // Initial hue.
    let hue = 120;
    // Track number of ticks since automated firework.
    let ticksSinceFireworkAutomated = 0;
    // Track number of ticks since manual firework.
    let ticksSinceFirework = 0;

    // === END LOCAL VARS ===

    // === HELPERS ===

    // Get a random number within the specified range.
    function random( min, max ) {
      return Math.random() * (max - min) + min;
    }

    // Calculate the distance between two points.
    function calculateDistance( aX, aY, bX, bY ) {
      let xDistance = aX - bX;
      let yDistance = aY - bY;
      return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
    }

    // === END HELPERS ===


    // === PROTOTYPING ===

    // Creates a new firework.
    // Path begins at 'start' point and ends and 'end' point.
    function Firework( startX, startY, endX, endY ) {
      // Set current coordinates.
      this.x = startX;
      this.y = startY;
      // Set starting coordinates.
      this.startX = startX;
      this.startY = startY;
      // Set end coordinates.
      this.endX = endX;
      this.endY = endY;
      // Get the distance to the end point.
      this.distanceToEnd = calculateDistance( startX, startY, endX, endY );
      this.distanceTraveled = 0;
      // Create an array to track current trail particles.
      this.trail = [];
      // Trail length determines how many trailing particles are active at once.
      this.trailLength = FIREWORK_TRAIL_LENGTH;
      // While the trail length remains, add current point to trail list.
      while ( this.trailLength-- ) {
        this.trail.push( [this.x, this.y] );
      }
      // Calculate the angle to travel from start to end point.
      this.angle = Math.atan2( endY - startY, endX - startX );
      // Set the speed.
      this.speed = FIREWORK_SPEED;
      // Set the acceleration.
      this.acceleration = FIREWORK_ACCELERATION;
      // Set the brightness.
      this.brightness = random( FIREWORK_BRIGHTNESS_MIN, FIREWORK_BRIGHTNESS_MAX );
      // Set the radius of click-target location.
      this.targetRadius = 2.5;
    }

    // Update a firework prototype.
    // 'index' parameter is index in 'fireworks' array to remove, if journey is complete.
    Firework.prototype.update = function ( index ) {
      // Remove the oldest trail particle.
      this.trail.pop();
      // Add the current position to the start of trail.
      this.trail.unshift( [this.x, this.y] );

      // Animate the target radius indicator.
      if ( FIREWORK_TARGET_INDICATOR_ENABLED ) {
        if ( this.targetRadius < 8 ) {
          this.targetRadius += 0.3;
        } else {
          this.targetRadius = 1;
        }
      }

      // Increase speed based on acceleration rate.
      this.speed *= this.acceleration;

      // Calculate current velocity for both x and y axes.
      let xVelocity = Math.cos( this.angle ) * this.speed;
      let yVelocity = Math.sin( this.angle ) * this.speed;
      // Calculate the current distance travelled based on starting position, current position, and velocity.
      // This can be used to determine if firework has reached final position.
      this.distanceTraveled = calculateDistance( this.startX, this.startY, this.x + xVelocity, this.y + yVelocity );

      // Check if final position has been reached (or exceeded).
      if ( this.distanceTraveled >= this.distanceToEnd ) {
        // Destroy firework by removing it from collection.
        fireworks.splice( index, 1 );
        // Create particle explosion at end point.  Important not to use this.x and this.y,
        // since that position is always one animation loop behind.
        createParticles( this.endX, this.endY );
      } else {
        // End position hasn't been reached, so continue along current trajectory by updating current coordinates.
        this.x += xVelocity;
        this.y += yVelocity;
      }
    };

    // Draw a firework.
    // Use CanvasRenderingContext2D methods to create strokes as firework paths.
    Firework.prototype.draw = function () {
      // Begin a new path for firework trail.
      context.beginPath();
      // Get the coordinates for the oldest trail position.
      let trailEndX = this.trail[this.trail.length - 1][0];
      let trailEndY = this.trail[this.trail.length - 1][1];
      // Create a trail stroke from trail end position to current firework position.
      context.moveTo( trailEndX, trailEndY );
      context.lineTo( this.x, this.y );
      // Set stroke coloration and style.
      // Use hue, saturation, and light values instead of RGB.
      context.strokeStyle = `hsl(${ hue }, 100%, ${ this.brightness }%)`;
      // Draw stroke.
      context.stroke();

      if ( FIREWORK_TARGET_INDICATOR_ENABLED ) {
        // Begin a new path for end position animation.
        context.beginPath();
        // Create an pulsing circle at the end point with targetRadius.
        context.arc( this.endX, this.endY, this.targetRadius, 0, Math.PI * 2 );
        // Draw stroke.
        context.stroke();
      }
    };

    // Creates a new particle at provided 'x' and 'y' coordinates.
    function Particle( x, y ) {
      // Set current position.
      this.x = x;
      this.y = y;
      // To better simulate a firework, set the angle of travel to random value in any direction.
      this.angle = random( 0, Math.PI * 2 );
      // Set friction.
      this.friction = PARTICLE_FRICTION;
      // Set gravity.
      this.gravity = PARTICLE_GRAVITY;
      // Set the hue to somewhat randomized number.
      // This gives the particles within a firework explosion an appealing variance.
      this.hue = random( hue - PARTICLE_HUE_VARIANCE, hue + PARTICLE_HUE_VARIANCE );
      // Set brightness.
      this.brightness = random( PARTICLE_BRIGHTNESS_MIN, PARTICLE_BRIGHTNESS_MAX );
      // Set decay.
      this.decay = random( PARTICLE_DECAY_MIN, PARTICLE_DECAY_MAX );
      // Set speed.
      this.speed = random( PARTICLE_SPEED_MIN, PARTICLE_SPEED_MAX );
      // Create an array to track current trail particles.
      this.trail = [];
      // Trail length determines how many trailing particles are active at once.
      this.trailLength = PARTICLE_TRAIL_LENGTH;
      // While the trail length remains, add current point to trail list.
      while ( this.trailLength-- ) {
        this.trail.push( [this.x, this.y] );
      }
      // Set transparency.
      this.transparency = PARTICLE_TRANSPARENCY;
    }

    // Update a particle prototype.
    // 'index' parameter is index in 'particles' array to remove, if journey is complete.
    Particle.prototype.update = function ( index ) {
      // Remove the oldest trail particle.
      this.trail.pop();
      // Add the current position to the start of trail.
      this.trail.unshift( [this.x, this.y] );

      // Decrease speed based on friction rate.
      this.speed *= this.friction;
      // Calculate current position based on angle, speed, and gravity (for y-axis only).
      this.x += Math.cos( this.angle ) * this.speed;
      this.y += Math.sin( this.angle ) * this.speed + this.gravity;

      // Apply transparency based on decay.
      this.transparency -= this.decay;
      // Use decay rate to determine if particle should be destroyed.
      if ( this.transparency <= this.decay ) {
        // Destroy particle once transparency level is below decay.
        particles.splice( index, 1 );
      }
    };

    // Draw a particle.
    // Use CanvasRenderingContext2D methods to create strokes as particle paths.
    Particle.prototype.draw = function () {
      // Begin a new path for particle trail.
      context.beginPath();
      // Get the coordinates for the oldest trail position.
      let trailEndX = this.trail[this.trail.length - 1][0];
      let trailEndY = this.trail[this.trail.length - 1][1];
      // Create a trail stroke from trail end position to current particle position.
      context.moveTo( trailEndX, trailEndY );
      context.lineTo( this.x, this.y );
      // Set stroke coloration and style.
      // Use hue, brightness, and transparency instead of RGBA.
      context.strokeStyle = `hsla(${ this.hue }, 100%, ${ this.brightness }%, ${ this.transparency })`;
      context.stroke();
    };

    // === END PROTOTYPING ===

    // === APP HELPERS ===

    // Cleans up the canvas by removing older trails.
    //
    // In order to smoothly transition trails off the canvas, and to make them
    // appear more realistic, we're using a composite fill.
    // Set the initial composite mode to 'destination-out' to keep content that
    // overlap with the fill we're adding.
    //
    // see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
    function cleanCanvas() {
      // Set 'destination-out' composite mode, so additional fill doesn't remove non-overlapping content.
      context.globalCompositeOperation = 'destination-out';
      // Set alpha level of content to remove.
      // Lower value means trails remain on screen longer.
      context.fillStyle = `rgba(0, 0, 0, ${ CANVAS_CLEANUP_ALPHA })`;
      // Fill entire canvas.
      context.fillRect( 0, 0, canvas.width, canvas.height );
      // Reset composite mode to 'lighter', so overlapping particles brighten each other.
      context.globalCompositeOperation = 'lighter';
    }

    // Create particle explosion at 'x' and 'y' coordinates.
    function createParticles( x, y ) {
      // Set particle count.
      // Higher numbers may reduce performance.
      let particleCount = PARTICLE_COUNT;
      while ( particleCount-- ) {
        // Create a new particle and add it to particles collection.
        particles.push( new Particle( x, y ) );
      }
    }

    // Launch fireworks automatically.
    function launchAutomatedFirework() {
      // Determine if ticks since last automated launch is greater than random min/max values.
      if ( ticksSinceFireworkAutomated >= random( TICKS_PER_FIREWORK_AUTOMATED_MIN, TICKS_PER_FIREWORK_AUTOMATED_MAX ) ) {
        // Check if mouse is not currently clicked.
        if ( !isMouseDown ) {
          // Set start position to bottom center.
          let startX = canvas.width / 2;
          let startY = canvas.height;
          // Set end position to random position, somewhere in the top half of screen.
          let endX = random( 0, canvas.width );
          let endY = random( 0, canvas.height / 2 );
          // Create new firework and add to collection.
          fireworks.push( new Firework( startX, startY, endX, endY ) );
          // Reset tick counter.
          ticksSinceFireworkAutomated = 0;
        }
      } else {
        // Increment counter.
        ticksSinceFireworkAutomated++;
      }
    }

    // Update all active fireworks.
    function updateFireworks() {
      // Loop backwards through all fireworks, drawing and updating each.
      for ( let i = fireworks.length - 1; i >= 0; --i ) {
        fireworks[i].draw();
        fireworks[i].update( i );
      }
    }

    // Update all active particles.
    function updateParticles() {
      // Loop backwards through all particles, drawing and updating each.
      for ( let i = particles.length - 1; i >= 0; --i ) {
        particles[i].draw();
        particles[i].update( i );
      }
    }

    // === END APP HELPERS ===

    let stop = false;
    const timer = 30;

    // Primary loop.
    const loop = ( completed ) => {

      if ( stop ) return;

      // Fade out early
      setTimeout( () => ( typeof completed === 'function' && completed() ), timer * 1000 - 2500 );

      // Stop animation
      setTimeout( () => stop =  true, timer * 1000 );

      // Adjusts coloration of fireworks over time.
      hue += HUE_STEP_INCREASE;

      // Clean the canvas.
      cleanCanvas();

      // Update fireworks.
      updateFireworks();

      // Update particles.
      updateParticles();

      // Launch automated fireworks.
      launchAutomatedFirework();

      // Smoothly request animation frame for each loop iteration.
      requestAnimationFrame( loop );
    };

    return loop;

  };

  let loop = null;

  export default {
    name: 'fireworks',

    data() {
      return {
        darken: false,
        active: false,
        showHero: false,
      };
    },

    methods: {
      create () {
        loop = fireworks();
      },

      start () {
        console.log( 'Starting Fireworks' );

        this.active = true;
        this.darken = false;

        this.create();

        this.$nextTick( () => {
          this.darken = true;
          setTimeout( () => this.beginLoop() , 1500 );
        });
      },

      beginLoop () {
        loop( () => this.onEnd() );
        setTimeout( () => this.showHero = true, 15 * 1000 );
      },

      onEnd () {
        console.log( 'Ending Fireworks' );

        this.darken = false;

        setTimeout( () => {
          this.darken   = false;
          this.active   = false;
          this.showHero = false;
        }, 2500 );
      },
    },

    computed: {},

    mounted() {

    },
  };
</script>

<style lang='scss'>
  #fireworks {
    pointer-events: none;

    z-index: 100;

    position: fixed;;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background: rgba( 0, 0, 0, 0 );
    opacity: 0;
    transition: 2.5s;

    &.darken {
      background: rgba( 0, 0, 0, 0.55 );
      opacity: 1;
    }

    canvas {

    }

    .hero {
      position: fixed;
      top: 25%;
      color: white;
      text-align: center;
      width: 100%;
      opacity: 0;
      transition: 2.5s;
      text-shadow: 0 2px 7px rgba(0,0,0,0.55);

      &.show {
        opacity: 1;
      }
    }
  }
</style>
