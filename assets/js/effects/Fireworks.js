// Created by xander on 1/2/2020

// Get a random number within the specified range.
const random = ( min, max ) => Math.random() * (max - min) + min;

// Calculate the distance between two points.
const calculateDistance = ( aX, aY, bX, bY ) => {
  let xDistance = aX - bX;
  let yDistance = aY - bY;
  return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
};

const validDOMElement = testObject => {
  try {
    return testObject instanceof HTMLElement;
  } catch ( e ) {
    return typeof testObject === 'object'
      && testObject.nodeType === 1
      && typeof testObject.style === 'object'
      && typeof testObject.ownerDocument === 'object';
  }
};

const getCanvas = canvas => {
  if ( !canvas )
    return document.getElementById( 'canvas' );
  else if ( typeof canvas === 'string' )
    return document.getElementById( canvas );
  else {
    if ( validDOMElement( canvas ) ) return canvas;
    else {
      throw( 'invalid DOM element for Fireworks canvas' );
    }
  }
};

class Fireworks {
  constructor( canvas, configuration ) {
    // === CONFIGURATION ===

    // Base firework acceleration.
    // 1.0 causes fireworks to travel at a constant speed.
    // Higher number increases rate firework accelerates over time.
    this.FIREWORK_ACCELERATION = 1.05;
    // Minimum firework brightness.
    this.FIREWORK_BRIGHTNESS_MIN = 50;
    // Maximum firework brightness.
    this.FIREWORK_BRIGHTNESS_MAX = 70;
    // Base speed of fireworks.
    this.FIREWORK_SPEED = 5;
    // Base length of firework trails.
    this.FIREWORK_TRAIL_LENGTH = 3;
    // Determine if target position indicator is enabled.
    this.FIREWORK_TARGET_INDICATOR_ENABLED = false;

    // Minimum particle brightness.
    this.PARTICLE_BRIGHTNESS_MIN = 50;
    // Maximum particle brightness.
    this.PARTICLE_BRIGHTNESS_MAX = 80;
    // Base particle count per firework. (def: 100)
    this.PARTICLE_COUNT = 35;
    // Minimum particle decay rate.
    this.PARTICLE_DECAY_MIN = 0.015;
    // Maximum particle decay rate.
    this.PARTICLE_DECAY_MAX = 0.03;
    // Base particle friction.
    // Slows the speed of particles over time.
    this.PARTICLE_FRICTION = 0.95;
    // Base particle gravity.
    // How quickly particles move toward a downward trajectory.
    this.PARTICLE_GRAVITY = 0.7;
    // Variance in particle coloration.
    this.PARTICLE_HUE_VARIANCE = 20;
    // Base particle transparency.
    this.PARTICLE_TRANSPARENCY = 1;
    // Minimum particle speed.
    this.PARTICLE_SPEED_MIN = 1;
    // Maximum particle speed.
    this.PARTICLE_SPEED_MAX = 10;
    // Base length of explosion particle trails.
    this.PARTICLE_TRAIL_LENGTH = 5;

    // Alpha level that canvas cleanup iteration removes existing trails.
    // Lower value increases trail duration.
    this.CANVAS_CLEANUP_ALPHA = 0.15;
    // Hue change per loop, used to rotate through different firework colors.
    this.HUE_STEP_INCREASE = 0.5;

    // Minimum number of ticks between each automatic firework launch.
    this.TICKS_PER_FIREWORK_AUTOMATED_MIN = 20;
    // Maximum number of ticks between each automatic firework launch.
    this.TICKS_PER_FIREWORK_AUTOMATED_MAX = 80;

    // === END CONFIGURATION ===

    this.canvas = getCanvas( canvas );

    // TODO: don't override the canvas size
    // this.canvas.width  = window.innerWidth;
    // this.canvas.height = window.innerHeight;

    console.log( `canvas:`,  this.canvas );

    this.canvas.width  = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    // Set the context, 2d in this case.
    this.context = this.canvas.getContext( '2d' );

    // Firework and particles collections.
    this.fireworks = [];
    this.particles = [];

    // Initial hue.
    this.hue = 120;
    // Track number of ticks since automated firework.
    this.ticksSinceFireworkAutomated = 0;

    // Control flow variables
    this.STOP = false;
    this.resolve = null;
    this.timer = null;

    this.configs = {
      FIREWORK_CONFIG: this.fireworkConfig(),
      PARTICLE_CONFIG: this.particleConfig(),
    };
  }

  fireworkConfig () {
    return {
      FIREWORK_TRAIL_LENGTH: this.FIREWORK_TRAIL_LENGTH,
      FIREWORK_SPEED: this.FIREWORK_SPEED,
      FIREWORK_ACCELERATION: this.FIREWORK_ACCELERATION,
      FIREWORK_BRIGHTNESS_MIN: this.FIREWORK_BRIGHTNESS_MIN,
      FIREWORK_BRIGHTNESS_MAX: this.FIREWORK_BRIGHTNESS_MAX,
      FIREWORK_TARGET_INDICATOR_ENABLED: this.FIREWORK_TARGET_INDICATOR_ENABLED,
    }
  }

  particleConfig () {
    return {
      PARTICLE_FRICTION: this.PARTICLE_FRICTION,
      PARTICLE_GRAVITY: this.PARTICLE_GRAVITY,
      PARTICLE_HUE_VARIANCE: this.PARTICLE_HUE_VARIANCE,
      PARTICLE_BRIGHTNESS_MIN: this.PARTICLE_BRIGHTNESS_MIN,
      PARTICLE_BRIGHTNESS_MAX: this.PARTICLE_BRIGHTNESS_MAX,
      PARTICLE_DECAY_MIN: this.PARTICLE_DECAY_MIN,
      PARTICLE_DECAY_MAX: this.PARTICLE_DECAY_MAX,
      PARTICLE_SPEED_MIN: this.PARTICLE_SPEED_MIN,
      PARTICLE_SPEED_MAX: this.PARTICLE_SPEED_MAX,
      PARTICLE_TRAIL_LENGTH: this.PARTICLE_TRAIL_LENGTH,
      PARTICLE_TRANSPARENCY: this.PARTICLE_TRANSPARENCY,
    }
  }

  // Launch fireworks automatically.
  launchFirework () {
    // Determine if ticks since last automated launch is greater than random min/max values.
    if ( this.ticksSinceFireworkAutomated >= random( this.TICKS_PER_FIREWORK_AUTOMATED_MIN, this.TICKS_PER_FIREWORK_AUTOMATED_MAX ) ) {
      // Set start position to bottom center.
      const startX = this.canvas.width / 2;
      const startY = this.canvas.height;
      // Set end position to random position, somewhere in the top half of screen.
      const endX = random( 0, this.canvas.width );
      const endY = random( 0, this.canvas.height / 2 );
      // Create new firework and add to collection.
      this.fireworks.push( new Firework( startX, startY, endX, endY, this.hue, this.configs.FIREWORK_CONFIG ) );
      // Reset tick counter.
      this.ticksSinceFireworkAutomated = 0;
    } else {
      // Increment counter.
      this.ticksSinceFireworkAutomated++;
    }
  }

  // Create particle explosion at 'x' and 'y' coordinates.
  createParticles ( x, y, hue ) {
    // Set particle count.
    // Higher numbers may reduce performance.
    let particleCount = this.PARTICLE_COUNT;
    while ( particleCount-- ) {
      // Create a new particle and add it to particles collection.
      this.particles.push( new Particle( x, y, hue, this.configs.PARTICLE_CONFIG ) );
    }
  }

  // Update all active fireworks.
  updateFireworks () {
    // Loop backwards through all fireworks, drawing and updating each.
    for ( let i = this.fireworks.length - 1; i >= 0; --i ) {
      this.fireworks[i].draw( this.context );
      const explode = this.fireworks[i].update();
      if ( explode ) {
        // Create particle explosion at end point.  Important not to use this.x and this.y,
        // since that position is always one animation loop behind.
        this.createParticles( this.fireworks[i].endX, this.fireworks[i].endY, this.fireworks[i].hue );
        // Destroy firework by removing it from collection.
        this.fireworks.splice( i, 1 );
      }
    }
  }

  // Update all active particles.
  updateParticles () {
    // Loop backwards through all particles, drawing and updating each.
    for ( let i = this.particles.length - 1; i >= 0; --i ) {
      this.particles[i].draw( this.context );
      // Destroy particle once transparency level is below decay.
      const destroy = this.particles[i].update();
      if ( destroy ) {
        this.particles.splice( i, 1 );
      }
    }
  }

  // Cleans up the canvas by removing older trails.
  //
  // In order to smoothly transition trails off the canvas, and to make them
  // appear more realistic, we're using a composite fill.
  // Set the initial composite mode to 'destination-out' to keep content that
  // overlap with the fill we're adding.
  //
  // see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
  cleanCanvas () {
    // Set 'destination-out' composite mode, so additional fill doesn't remove non-overlapping content.
    this.context.globalCompositeOperation = 'destination-out';
    // Set alpha level of content to remove.
    // Lower value means trails remain on screen longer.
    this.context.fillStyle = `rgba(0, 0, 0, ${ this.CANVAS_CLEANUP_ALPHA })`;
    // Fill entire canvas.
    this.context.fillRect( 0, 0, this.canvas.width, this.canvas.height );
    // Reset composite mode to 'lighter', so overlapping particles brighten each other.
    this.context.globalCompositeOperation = 'lighter';
  }

  onEnd () {
    this.fireworks = [];
    this.particles = [];
    // Clear entire canvas.
    this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
  }

  update () {
    // Control flow logic
    if ( this.STOP ) {
      this.onEnd();

      if ( this.resolve ) {
        this.resolve();
        this.resolve = null;
      }
      if ( this.timer ) {
        clearTimeout( this.timer );
        this.timer = null;
      }
      return;
    }

    // Adjusts coloration of fireworks over time.
    this.hue += this.HUE_STEP_INCREASE;

    // Clean the canvas.
    this.cleanCanvas();

    // Update fireworks.
    this.updateFireworks();

    // Update particles.
    this.updateParticles();

    // Launch automated fireworks.
    this.launchFirework();

    // Loop
    requestAnimationFrame( () => this.update() );
  }

  async start ( duration ) {
    this.configs = {
      FIREWORK_CONFIG: this.fireworkConfig(),
      PARTICLE_CONFIG: this.particleConfig(),
    };
    this.STOP = false;
    this.update();
    return await new Promise(resolve => {
      this.resolve = resolve;
      this.timer = setTimeout( () => {
        this.stop();
      }, duration || 15 );
    });
  }

  stop () {
    this.STOP = true;
  }

}

// Creates a new firework.
// Path begins at 'start' point and ends and 'end' point.
class Firework {

  constructor( startX, startY, endX, endY, hue, config ) {
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
    this.trailLength = config.FIREWORK_TRAIL_LENGTH;
    // While the trail length remains, add current point to trail list.
    while ( this.trailLength-- ) {
      this.trail.push( [this.x, this.y] );
    }

    // Calculate the angle to travel from start to end point.
    this.angle = Math.atan2( endY - startY, endX - startX );
    // Set the speed.
    this.speed = config.FIREWORK_SPEED;
    // Set the acceleration.
    this.acceleration = config.FIREWORK_ACCELERATION;
    // Set the brightness.
    this.brightness = random( config.FIREWORK_BRIGHTNESS_MIN, config.FIREWORK_BRIGHTNESS_MAX );
    // Set the color
    this.hue = hue;
    // Set the radius of click-target location.
    this.targetRadius = 2.5;

    this.targetIndicator = config.FIREWORK_TARGET_INDICATOR_ENABLED;
  }

  // Update a firework prototype.
  // 'index' parameter is index in 'fireworks' array to remove, if journey is complete.
  update () {

    // Remove the oldest trail particle.
    this.trail.pop();
    // Add the current position to the start of trail.
    this.trail.unshift( [this.x, this.y] );

    // Animate the target radius indicator.
    if ( this.targetIndicator ) {
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
      return true;
    } else {
      // End position hasn't been reached, so continue along current trajectory by updating current coordinates.
      this.x += xVelocity;
      this.y += yVelocity;
    }
  }

  // Draw a firework.
  // Use CanvasRenderingContext2D methods to create strokes as firework paths.
  draw ( context ) {
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
    context.strokeStyle = `hsl(${ this.hue }, 100%, ${ this.brightness }%)`;
    // Draw stroke.
    context.stroke();

    if ( this.targetIndicator ) {
      // Begin a new path for end position animation.
      context.beginPath();
      // Create an pulsing circle at the end point with targetRadius.
      context.arc( this.endX, this.endY, this.targetRadius, 0, Math.PI * 2 );
      // Draw stroke.
      context.stroke();
    }
  }

}

// Create particle explosion at 'x' and 'y' coordinates.
class Particle {

  constructor( x, y, hue, config ) {
    // Set current position.
    this.x = x;
    this.y = y;
    // To better simulate a firework, set the angle of travel to random value in any direction.
    this.angle = random( 0, Math.PI * 2 );
    // Set friction.
    this.friction = config.PARTICLE_FRICTION;
    // Set gravity.
    this.gravity = config.PARTICLE_GRAVITY;
    // Set the hue to somewhat randomized number.
    // This gives the particles within a firework explosion an appealing variance.
    this.hue = random( hue - config.PARTICLE_HUE_VARIANCE, hue + config.PARTICLE_HUE_VARIANCE );
    // Set brightness.
    this.brightness = random( config.PARTICLE_BRIGHTNESS_MIN, config.PARTICLE_BRIGHTNESS_MAX );
    // Set decay.
    this.decay = random( config.PARTICLE_DECAY_MIN, config.PARTICLE_DECAY_MAX );
    // Set speed.
    this.speed = random( config.PARTICLE_SPEED_MIN, config.PARTICLE_SPEED_MAX );
    // Create an array to track current trail particles.
    this.trail = [];
    // Trail length determines how many trailing particles are active at once.
    this.trailLength = config.PARTICLE_TRAIL_LENGTH;
    // While the trail length remains, add current point to trail list.
    while ( this.trailLength-- ) {
      this.trail.push( [this.x, this.y] );
    }
    // Set transparency.
    this.transparency = config.PARTICLE_TRANSPARENCY;
  }

  // Update a particle prototype.
  // 'index' parameter is index in 'particles' array to remove, if journey is complete.
  update () {
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
    if ( this.transparency <= this.decay ) return true;
  }

  // Draw a particle.
  // Use CanvasRenderingContext2D methods to create strokes as particle paths.
  draw ( context ) {
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
  }

}

export { Fireworks };
