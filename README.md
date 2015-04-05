Pull to Refresh for the Web 1.1
===============================

![Web Pull to Refresh](http://apeatling.com/wp-content/uploads/2014/11/ptr-header1-1000x400.png)

This is a pull to refresh implementation for the web. It focuses on buttery UX performance and responsiveness to feel as close to a native implementation as possible.

[Try a Demo](http://apeatling.com/demos/web-ptr/) | [Read the Blog Post](http://apeatling.com/2014/javascript-pull-to-refresh-web/)

## Usage

There are two core elements needed, the content element and the pull to refresh UX element. The demo uses this setup, but you can modify this however you'd like.

```
<div id="ptr">
  <!-- Pull down arrow indicator -->
  <span class="genericon genericon-next"></span>

  <!-- CSS-based loading indicator -->
  <div class="loading">
    <span id="l1"></span>
    <span id="l2"></span>
    <span id="l3"></span>
  </div>
</div>

<div id="content">
  <!-- Content that should be draggable for refreshing goes in here -->
</div>
```

This will work just fine with your own loading indicators or pull down arrow, just make sure they're wrapped in the element you're using to hold the pull to refresh UX. Don't forget to include the CSS if you want to use a similar visual setup as the demo.

In order for this to function, you'll need to load both Hammer.js and the wptr.js script, and then initialize the WebPullToRefresh module. Add this just before the closing body tag:

```
<script src="lib/hammer.2.0.4.js"></script>
<script src="lib/wptr.1.0.js"></script>

<script>
  window.onload = function() {
    WebPullToRefresh.init( {
      loadingFunction: exampleLoadingFunction
    } );
  };
</script>
```

You will also need to provide a loading function at initization time. This function should perform the async loading pieces you need to load new items, and return a promise.

```
var exampleLoadingFunction = function() {
  return new Promise( function( resolve, reject ) {
    // Run some async loading code here

    if ( /* if the loading worked */ ) {
      resolve();
    } else {
      reject();
    }
  } );
};
```

### Optional Parameters

There are a few optional parameters you can pass on initialization:

```
{
	// ID of the element holding dragable content area
	contentEl: 'content', 

	// ID of the element holding pull to refresh loading area
	ptrEl: 'ptr', 

	// Number of pixels of dragging down until refresh will fire
	distanceToRefresh: 70, 

  // The dragging resistance level, the higher the more you'll need to drag down.
  resistance: 2.5
}
```

[Try a Demo](http://apeatling.com/demos/web-ptr/) | [Read the Blog Post](http://apeatling.com/2014/javascript-pull-to-refresh-web/)
