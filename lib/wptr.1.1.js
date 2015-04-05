var WebPullToRefresh = (function () {
	'use strict';

	/**
	 * Hold all of the default parameters for the module
	 * @type {object}
	 */	
	var defaults = {
		// ID of the element holding pannable content area
		contentEl: 'content', 

		// ID of the element holding pull to refresh loading area
		ptrEl: 'ptr', 

		// Number of pixels of panning until refresh 
		distanceToRefresh: 70, 

		// Pointer to function that does the loading and returns a promise
		loadingFunction: false,

		// Dragging resistance level
		resistance: 2.5
	};

	/**
	 * Hold all of the merged parameter and default module options
	 * @type {object}
	 */
	var options = {};

	/**
	 * Pan event parameters
	 * @type {object}
	 */
	var pan = {
		enabled: false,
		distance: 0,
		startingPositionY: 0
	};
	
	/**
	 * Easy shortener for handling adding and removing body classes.
	 */
	var bodyClass = document.body.classList;
	
	/**
	 * Initialize pull to refresh, hammer, and bind pan events.
	 * 
	 * @param {object=} params - Setup parameters for pull to refresh
	 */
	var init = function( params ) {
		params = params || {};
		options = {
			contentEl: params.contentEl || document.getElementById( defaults.contentEl ),
			ptrEl: params.ptrEl || document.getElementById( defaults.ptrEl ),
			distanceToRefresh: params.distanceToRefresh || defaults.distanceToRefresh,
			loadingFunction: params.loadingFunction || defaults.loadingFunction,
			resistance: params.resistance || defaults.resistance
		};

		if ( ! options.contentEl || ! options.ptrEl ) {
			return false;
		}

		var h = new Hammer( options.contentEl );

		h.get( 'pan' ).set( { direction: Hammer.DIRECTION_VERTICAL } );

		h.on( 'panstart', _panStart );
		h.on( 'pandown', _panDown );
		h.on( 'panup', _panUp );
		h.on( 'panend', _panEnd );
	};

	/**
	 * Determine whether pan events should apply based on scroll position on panstart
	 * 
	 * @param {object} e - Event object
	 */
	var _panStart = function(e) {
		pan.startingPositionY = document.body.scrollTop;

		if ( pan.startingPositionY === 0 ) {
			pan.enabled = true;
		}
	};

	/**
	 * Handle element on screen movement when the pandown events is firing.
	 * 
	 * @param {object} e - Event object
	 */
	var _panDown = function(e) {
		if ( ! pan.enabled ) {
			return;
		}

		e.preventDefault();
		pan.distance = e.distance / options.resistance;

		_setContentPan();
		_setBodyClass();
	};

	/**
	 * Handle element on screen movement when the pandown events is firing.
	 * 
	 * @param {object} e - Event object
	 */
	var _panUp = function(e) {
		if ( ! pan.enabled || pan.distance === 0 ) {
			return;
		}

		e.preventDefault();

		if ( pan.distance < e.distance / options.resistance ) {
			pan.distance = 0;
		} else {
			pan.distance = e.distance / options.resistance;
		}

		_setContentPan();
		_setBodyClass();
	};

	/**
	 * Set the CSS transform on the content element to move it on the screen.
	 */
	var _setContentPan = function() {
		// Use transforms to smoothly animate elements on desktop and mobile devices
		options.contentEl.style.transform = options.contentEl.style.webkitTransform = 'translate3d( 0, ' + pan.distance + 'px, 0 )';
		options.ptrEl.style.transform = options.ptrEl.style.webkitTransform = 'translate3d( 0, ' + ( pan.distance - options.ptrEl.offsetHeight ) + 'px, 0 )';
	};

	/**
	 * Set/remove the loading body class to show or hide the loading indicator after pull down.
	 */
	var _setBodyClass = function() {
		if ( pan.distance > options.distanceToRefresh ) {
			bodyClass.add( 'ptr-refresh' );
		} else {
			bodyClass.remove( 'ptr-refresh' );
		}		
	};

	/**
	 * Determine how to animate and position elements when the panend event fires.
	 * 
	 * @param {object} e - Event object
	 */
	var _panEnd = function(e) {
		if ( ! pan.enabled ) {
			return;
		}

		e.preventDefault();

		options.contentEl.style.transform = options.contentEl.style.webkitTransform = '';
		options.ptrEl.style.transform = options.ptrEl.style.webkitTransform = '';

		if ( document.body.classList.contains( 'ptr-refresh' ) ) {
			_doLoading();
		} else {
			_doReset();
		}

		pan.distance = 0;
		pan.enabled = false;
	};

	/**
	 * Position content and refresh elements to show that loading is taking place.
	 */
	var _doLoading = function() {
		bodyClass.add( 'ptr-loading' );

		// If no valid loading function exists, just reset elements
		if ( ! options.loadingFunction ) {
			return _doReset();
		}

		// The loading function should return a promise
		var loadingPromise = options.loadingFunction();

		// For UX continuity, make sure we show loading for at least one second before resetting
		setTimeout( function() {
			// Once actual loading is complete, reset pull to refresh
			loadingPromise.then( _doReset );
		}, 1000 );
	};

	/**
	 * Reset all elements to their starting positions before any paning took place.
	 */
	var _doReset = function() {
		bodyClass.remove( 'ptr-loading' );
		bodyClass.remove( 'ptr-refresh' );
		bodyClass.add( 'ptr-reset' );

		var bodyClassRemove = function() {
			bodyClass.remove( 'ptr-reset' );
			document.body.removeEventListener( 'transitionend', bodyClassRemove, false );
		};

		document.body.addEventListener( 'transitionend', bodyClassRemove, false );
	};

	return {
		init: init
	}

})();