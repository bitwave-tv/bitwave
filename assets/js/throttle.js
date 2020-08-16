// Created by xander on 8/16/2020

/*
The throttle function is a handy utility function.

Throttle's goals are:
  1. Fire instantly if possible
  2. Prevent additional calls from executing within a period of time
  3. Ensure that if called multiple times within that time frame, it executes at the end of the time frame.
  4. Ensure that if called multiple times, when 3. occurs, it uses the most recent context & arguments
  5. actually works

Throttle has many places it could be helpful:
   - Reducing frequency of function execution for frequently called events such as 'mousemove'
   - Reducing frequency of calls made to an API
   - Reducing how often a window resize event triggers a function,
     while also ensuring that once the event has stopped firing the most recent
     call's event arguments are used.
       - That allows for large / complicated reflows to occur infrequently for
         performance savings, while also ensuring once the user stops interacting
         the last values are used so that it renders properly.

It will immediately fire when invoked (therefore it does not delay calls),
and also guarantees execution for successive calls within the delay window.
That is, if the function is called twice within it's delay time frame,
it will instantly fire for the first called, and also fire at the end of the delay for the second call.

If the function is called more than twice, e.g. 5 times,
it will fire for the first call instantly.
Then for calls 2, 3, and 4, it will update the arguments and context for the wrapped function,
BUT only the 5th call will be executed,

In essence, it completely dropping intermediate function calls, context, and arguments.

To clarify, only the FIRST and LAST (if applicable) calls to the throttled function are executed,
and ALL intermediate calls are dropped.

Throttle does not guarantee (and does not try to guarantee) function execution,
it merely ensures that a function does not get called more often than the delay amount.

**************************************************************************************
****** IF IT IS IMPORTANT THAT ALL CALLS ARE EXECUTED; DO NOT USE THIS FUNCTION ******
**************************************************************************************

e.g. this should not be used for throttling how often chat is updated receiving chat messages,
 as it would only add the first and last message, dropping all intermediate chats between updates.

 I'm not sure why I wrote more documentation than code for this, but it's too late now.
 */

/**
 * A function wrapper that returns a function that will limit
 * how frequently the callback is called. This fires instantly
 * and returns early for subsequent calls within the delay
 * @param callback
 * @param delay
 * @return {wrapper}
 */
const throttle = ( callback, delay ) => {
  let isThrottled = false, args, context;

  const wrapper = () => {
    if ( isThrottled ) {
      args = arguments;
      context = this;
      return true;
    }

    isThrottled = true;
    callback.apply( this, arguments );

    setTimeout(() => {
      isThrottled = false;
      if ( args ) {
        wrapper.apply( context, args );
        args = context = null;
      }
    }, delay);

    return false;
  }

  return wrapper;
}

export {
  throttle,
}
