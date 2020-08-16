// Created by xander on 8/16/2020

/*
The throttle function is a handy utility function.

There are many ways to throttle and debounce, so allow me to write a novel
about how this one throttles, what it's goals are, how it achieves those goals,
some well-intended use cases, and a warning about when NOT to use this utility.

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

 Lastly, when the wrapper function is called it returns a boolean variable that returns true if throttled.

 I'm not sure why I wrote more documentation than code for this, but it's too late now (⊙_⊙;)
 */


/**
 * A utility function wrapper that returns a `function` that will limit
 * how frequently the `callback` is called. This fires instantly
 * and returns early for subsequent calls within the delay.
 * @param {function} callback
 *   Some function to be throttled
 * @param {number} delay
 *   Minimum amount of time between calls
 * @return {function} wrapper: A function that when called invokes the callback at most once per `delay` interval
 *
 *   - This also guarantees a final call at the end of `delay`, called with the most recent context and arguments.
 *   - Intermediate calls are dropped.
 */
export const throttle = ( callback, delay ) => {
  let isThrottled = false, args, context;

  // Create function wrapper preserving arguments and context
  const wrapper = () => {
    // if we are throttled, set or update context & args
    // then return early as true, indicating we were throttled
    if ( isThrottled ) {
      args = arguments;
      context = this;
      return true;
    }

    // set flag for throttling check
    isThrottled = true;

    // immediately invoke when we are not throttled
    callback.apply( this, arguments );

    // set a time out for when our delay ends
    setTimeout(() => {

      // reset throttled flag
      isThrottled = false;

      // check if we need to execute our callback
      // at the end of our throttle delay
      // (this occurs when we call the wrapper more than once within the delay)
      if ( args ) {

        // execute our callback with the most recent context & args
        wrapper.apply( context, args );

        // reset to null to prepare for the next delay window
        args = context = null;
      }
    }, delay);

    // return false to indicate we were not throttled
    return false;
  }

  // returns an instance of throttle so this function is reusable
  return wrapper;
}

// the end.
