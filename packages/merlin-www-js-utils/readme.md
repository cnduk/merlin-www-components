## Modules

<dl>
<dt><a href="#module_detect">detect</a></dt>
<dd></dd>
<dt><a href="#module_functions">functions</a></dt>
<dd></dd>
</dl>

<a name="module_detect"></a>

## detect

* [detect](#module_detect)
    * [.getUserAgent](#module_detect.getUserAgent) ⇒ <code>Object</code>
    * [.hasHistory](#module_detect.hasHistory) : <code>Boolean</code>
    * [.hasTouch](#module_detect.hasTouch) : <code>Boolean</code>
    * [.isAndroid](#module_detect.isAndroid) : <code>Boolean</code>
    * [.isIOS](#module_detect.isIOS) : <code>Boolean</code>
    * [.isLinux](#module_detect.isLinux) : <code>Boolean</code>
    * [.isMac](#module_detect.isMac) : <code>Boolean</code>
    * [.isWindows](#module_detect.isWindows) : <code>Boolean</code>
    * [.supportBoxModel](#module_detect.supportBoxModel) ⇒ <code>Boolean</code>
    * [.supportsHTML5Video](#module_detect.supportsHTML5Video) ⇒ <code>Boolean</code>

<a name="module_detect.getUserAgent"></a>

### detect.getUserAgent ⇒ <code>Object</code>
Creates an object with user agent information

**Kind**: static property of <code>[detect](#module_detect)</code>  
**Url**: http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser  
<a name="module_detect.hasHistory"></a>

### detect.hasHistory : <code>Boolean</code>
window.history support

**Kind**: static property of <code>[detect](#module_detect)</code>  
<a name="module_detect.hasTouch"></a>

### detect.hasTouch : <code>Boolean</code>
Touch support

**Kind**: static property of <code>[detect](#module_detect)</code>  
<a name="module_detect.isAndroid"></a>

### detect.isAndroid : <code>Boolean</code>
Android useragent sniff

**Kind**: static property of <code>[detect](#module_detect)</code>  
<a name="module_detect.isIOS"></a>

### detect.isIOS : <code>Boolean</code>
iOS useragent sniff

**Kind**: static property of <code>[detect](#module_detect)</code>  
<a name="module_detect.isLinux"></a>

### detect.isLinux : <code>Boolean</code>
Linux useragent sniff

**Kind**: static property of <code>[detect](#module_detect)</code>  
<a name="module_detect.isMac"></a>

### detect.isMac : <code>Boolean</code>
Macintoch useragent sniff

**Kind**: static property of <code>[detect](#module_detect)</code>  
<a name="module_detect.isWindows"></a>

### detect.isWindows : <code>Boolean</code>
Windows useragent sniff

**Kind**: static property of <code>[detect](#module_detect)</code>  
<a name="module_detect.supportBoxModel"></a>

### detect.supportBoxModel ⇒ <code>Boolean</code>
Box model support

**Kind**: static property of <code>[detect](#module_detect)</code>  
<a name="module_detect.supportsHTML5Video"></a>

### detect.supportsHTML5Video ⇒ <code>Boolean</code>
HTML5 video support

**Kind**: static property of <code>[detect](#module_detect)</code>  
<a name="module_functions"></a>

## functions

* [functions](#module_functions)
    * [.addClass(el, cls)](#module_functions.addClass)
    * [.addEvent(el, type, fn)](#module_functions.addEvent)
    * [.addEventOnce(el, type, fn)](#module_functions.addEventOnce)
    * [.addHtml(node)](#module_functions.addHtml)
    * [.ajax(options)](#module_functions.ajax) ⇒ <code>Promise</code>
    * [.assign(target, ...source)](#module_functions.assign) ⇒ <code>Object</code>
    * [.clamp(min, max, value1)](#module_functions.clamp) ⇒ <code>Number/Function</code>
    * [.cloneArray(src)](#module_functions.cloneArray) ⇒ <code>Array</code>
    * [.cloneArrayDeep(src)](#module_functions.cloneArrayDeep) ⇒ <code>Array</code>
    * [.cloneObject(src)](#module_functions.cloneObject) ⇒ <code>Object</code>
    * [.cloneObjectDeep(src)](#module_functions.cloneObjectDeep) ⇒ <code>Object</code>
    * [.createEventTemplate(type, target, eventData)](#module_functions.createEventTemplate) ⇒ <code>Object</code>
    * [.debounce(fn, wait, scope, immediate)](#module_functions.debounce) ⇒ <code>function</code>
    * [.delegate(selector, fn, ctx)](#module_functions.delegate) ⇒ <code>function</code>
    * [.exitFullscreen(el)](#module_functions.exitFullscreen)
    * [.fireEvent(el, type, bubble, cancelable)](#module_functions.fireEvent) ⇒ <code>Boolean</code>
    * [.forEachShift(collection, fn)](#module_functions.forEachShift)
    * [.getElementOffset(el)](#module_functions.getElementOffset) ⇒ <code>Object</code>
    * [.getEventTarget(e)](#module_functions.getEventTarget) ⇒ <code>\*</code>
    * [.getIframeFromWindow(window)](#module_functions.getIframeFromWindow) ⇒ <code>HTMLNode/Boolean</code>
    * [.getObjectValues(obj, keys)](#module_functions.getObjectValues) ⇒ <code>Array.&lt;\*&gt;</code>
    * [.getParent(el, selector)](#module_functions.getParent) ⇒ <code>HTMLNode/Boolean</code>
    * [.getPrevious(el, selector)](#module_functions.getPrevious) ⇒ <code>HTMLElement/Boolean</code>
    * [.getParentUntil(el, selector)](#module_functions.getParentUntil) ⇒ <code>Object</code>
    * [.getPreviousElementUntil(el, selector)](#module_functions.getPreviousElementUntil) ⇒ <code>Object</code>
    * [.getScrollLeft(el)](#module_functions.getScrollLeft) ⇒ <code>Number</code>
    * [.getScrollTop(el)](#module_functions.getScrollTop) ⇒ <code>Number</code>
    * [.getNamespaceKey(abbr)](#module_functions.getNamespaceKey) ⇒ <code>String</code>
    * [.getWindowScrollLeft()](#module_functions.getWindowScrollLeft) ⇒ <code>Number</code>
    * [.getWindowScrollTop()](#module_functions.getWindowScrollTop) ⇒ <code>Number</code>
    * [.hasClass(el, cls)](#module_functions.hasClass) ⇒ <code>Boolean</code>
    * [.hasOwnProperty(obj, key)](#module_functions.hasOwnProperty) ⇒ <code>Boolean</code>
    * [.inherit(src, props)](#module_functions.inherit) ⇒ <code>Object</code>
    * [.insertBefore(child, ref)](#module_functions.insertBefore) ⇒ <code>HTMLElement</code>
    * [.isArray(src)](#module_functions.isArray) ⇒ <code>Boolean</code>
    * [.isArticleAdSlot(placement)](#module_functions.isArticleAdSlot) ⇒ <code>Boolean</code>
    * [.isDefined(value)](#module_functions.isDefined) ⇒ <code>Boolean</code>
    * [.isEmptyString(value)](#module_functions.isEmptyString) ⇒ <code>Boolean</code>
    * [.isElement(value)](#module_functions.isElement) ⇒ <code>Boolean</code>
    * [.isHeaderAdSlot(placement)](#module_functions.isHeaderAdSlot) ⇒ <code>Boolean</code>
    * [.isObject(src)](#module_functions.isObject) ⇒ <code>Boolean</code>
    * [.isSplashAdSlot(placement)](#module_functions.isSplashAdSlot) ⇒ <code>Boolean</code>
    * [.isWindow(win)](#module_functions.isWindow) ⇒ <code>Boolean</code>
    * [.loadScript(url, options)](#module_functions.loadScript) ⇒ <code>Promise</code>
    * [.loadSocialScripts()](#module_functions.loadSocialScripts) ⇒ <code>Promise</code>
    * [.not(value)](#module_functions.not) ⇒ <code>Boolean</code>
    * [.onPageLoad(loadFn)](#module_functions.onPageLoad)
    * [.onPageReady(readyFn)](#module_functions.onPageReady)
    * [.padValue(value, width, chr)](#module_functions.padValue) ⇒ <code>String</code>
    * [.randomUUID()](#module_functions.randomUUID) ⇒ <code>String</code>
    * [.removeClass(el, cls)](#module_functions.removeClass)
    * [.removeElement(el)](#module_functions.removeElement)
    * [.removeEvent(el, type, fn)](#module_functions.removeEvent)
    * [.throttle(fn, threshhold, scope)](#module_functions.throttle) ⇒ <code>function</code>
    * [.toBoolean(value)](#module_functions.toBoolean) ⇒ <code>Boolean</code>
    * [.toggleClass(el, cls)](#module_functions.toggleClass)
    * [.unescapeJinjaValue(value)](#module_functions.unescapeJinjaValue) ⇒ <code>\*</code>

<a name="module_functions.addClass"></a>

### functions.addClass(el, cls)
Adds a class to an element

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 
| cls | <code>String</code> | 

<a name="module_functions.addEvent"></a>

### functions.addEvent(el, type, fn)
Adds an event to an element

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 
| type | <code>String</code> | 
| fn | <code>function</code> | 

<a name="module_functions.addEventOnce"></a>

### functions.addEventOnce(el, type, fn)
Adds an event that will fire once and then remove itself

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 
| type | <code>String</code> | 
| fn | <code>function</code> | 

<a name="module_functions.addHtml"></a>

### functions.addHtml(node)
Adds html to a node

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| node | <code>HTMLElement</code> | 

<a name="module_functions.ajax"></a>

### functions.ajax(options) ⇒ <code>Promise</code>
Basic ajax function

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| options | <code>Object</code> | 

<a name="module_functions.assign"></a>

### functions.assign(target, ...source) ⇒ <code>Object</code>
Assigns the values of the other sources to the target

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| target | <code>Object</code> | 
| ...source | <code>Object</code> | 

<a name="module_functions.clamp"></a>

### functions.clamp(min, max, value1) ⇒ <code>Number/Function</code>
Clamps a value to the min and max. Also set up to allow currying.

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| min | <code>Number</code> | 
| max | <code>Number</code> | 
| value1 | <code>Number</code> | 

<a name="module_functions.cloneArray"></a>

### functions.cloneArray(src) ⇒ <code>Array</code>
Clones an array

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| src | <code>Array</code> | 

<a name="module_functions.cloneArrayDeep"></a>

### functions.cloneArrayDeep(src) ⇒ <code>Array</code>
Clones an array while recursively cloning the items inside

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| src | <code>Array</code> | 

<a name="module_functions.cloneObject"></a>

### functions.cloneObject(src) ⇒ <code>Object</code>
Clones an object

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| src | <code>Object</code> | 

<a name="module_functions.cloneObjectDeep"></a>

### functions.cloneObjectDeep(src) ⇒ <code>Object</code>
Clones an object whilst recursively cloning the descendants

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| src | <code>Object</code> | 

<a name="module_functions.createEventTemplate"></a>

### functions.createEventTemplate(type, target, eventData) ⇒ <code>Object</code>
Creates an object for events

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | The type of event |
| target | <code>Object</code> | The thing that emitted the event |
| eventData | <code>Object</code> | Some data |

<a name="module_functions.debounce"></a>

### functions.debounce(fn, wait, scope, immediate) ⇒ <code>function</code>
Debounce function, allows one function to be ran `wait` milliseconds after.

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> |  |
| wait | <code>Number</code> | Number of milliseconds |
| scope | <code>Object</code> |  |
| immediate | <code>Boolean</code> |  |

<a name="module_functions.delegate"></a>

### functions.delegate(selector, fn, ctx) ⇒ <code>function</code>
Creates a function that will delegate events to a selector

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| selector | <code>String</code> | 
| fn | <code>function</code> | 
| ctx | <code>\*</code> | 

<a name="module_functions.exitFullscreen"></a>

### functions.exitFullscreen(el)
Exits fullscreen mode for the element

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 

<a name="module_functions.fireEvent"></a>

### functions.fireEvent(el, type, bubble, cancelable) ⇒ <code>Boolean</code>
Fires an event on an element

**Kind**: static method of <code>[functions](#module_functions)</code>  
**Returns**: <code>Boolean</code> - Was the event cancelled?  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>HTMLElement</code> |  |
| type | <code>String</code> | The type of event |
| bubble | <code>Boolean</code> | Should the event bubble? |
| cancelable | <code>Boolean</code> | Should the event be cancelable? |

<a name="module_functions.forEachShift"></a>

### functions.forEachShift(collection, fn)
Loop over a collection and shift the item from the collection

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| collection | <code>Array</code> | 
| fn | <code>function</code> | 

<a name="module_functions.getElementOffset"></a>

### functions.getElementOffset(el) ⇒ <code>Object</code>
Gets the elements offset. Based off of jquerys implementation

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 

<a name="module_functions.getEventTarget"></a>

### functions.getEventTarget(e) ⇒ <code>\*</code>
Gets the event target

**Kind**: static method of <code>[functions](#module_functions)</code>  
**Returns**: <code>\*</code> - The target of the event  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Object</code> | The event information |

<a name="module_functions.getIframeFromWindow"></a>

### functions.getIframeFromWindow(window) ⇒ <code>HTMLNode/Boolean</code>
Gets the iframe element based on the window

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| window | <code>Window</code> | 

<a name="module_functions.getObjectValues"></a>

### functions.getObjectValues(obj, keys) ⇒ <code>Array.&lt;\*&gt;</code>
Gets the values from an object. If keys are specified, it will only get
the values of those keys.

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | Source object |
| keys | <code>Array.&lt;String&gt;</code> |  |

<a name="module_functions.getParent"></a>

### functions.getParent(el, selector) ⇒ <code>HTMLNode/Boolean</code>
Gets the parent element matching the selector. If it doesn't match, returns
nothing

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 
| selector | <code>String</code> | 

<a name="module_functions.getPrevious"></a>

### functions.getPrevious(el, selector) ⇒ <code>HTMLElement/Boolean</code>
Gets the previous element matching the selector. If it doesn't match,
returns false

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLElement</code> | 
| selector | <code>String</code> | 

<a name="module_functions.getParentUntil"></a>

### functions.getParentUntil(el, selector) ⇒ <code>Object</code>
Gets the parent till the selector or the root.

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 
| selector | <code>String</code> | 

<a name="module_functions.getPreviousElementUntil"></a>

### functions.getPreviousElementUntil(el, selector) ⇒ <code>Object</code>
Gets the previous element till the selector or the root

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 
| selector | <code>String</code> | 

<a name="module_functions.getScrollLeft"></a>

### functions.getScrollLeft(el) ⇒ <code>Number</code>
Gets the scroll left of the element

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode/Window</code> | 

<a name="module_functions.getScrollTop"></a>

### functions.getScrollTop(el) ⇒ <code>Number</code>
Gets the scroll top of the element

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode/Window</code> | 

<a name="module_functions.getNamespaceKey"></a>

### functions.getNamespaceKey(abbr) ⇒ <code>String</code>
Creates a key based on the brand abbreviation

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| abbr | <code>String</code> | 

<a name="module_functions.getWindowScrollLeft"></a>

### functions.getWindowScrollLeft() ⇒ <code>Number</code>
Gets the scrollleft of the window

**Kind**: static method of <code>[functions](#module_functions)</code>  
<a name="module_functions.getWindowScrollTop"></a>

### functions.getWindowScrollTop() ⇒ <code>Number</code>
Gets the scrolltop of the window

**Kind**: static method of <code>[functions](#module_functions)</code>  
<a name="module_functions.hasClass"></a>

### functions.hasClass(el, cls) ⇒ <code>Boolean</code>
Checks if the element has a class

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 
| cls | <code>String</code> | 

<a name="module_functions.hasOwnProperty"></a>

### functions.hasOwnProperty(obj, key) ⇒ <code>Boolean</code>
hasOwnProperty that prevents contamination from the object being tested

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| obj | <code>Object</code> | 
| key | <code>String</code> | 

<a name="module_functions.inherit"></a>

### functions.inherit(src, props) ⇒ <code>Object</code>
Creates a new object based from src. Then copies over any properties.

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| src | <code>Object</code> | 
| props | <code>Object</code> &#124; <code>Undefined</code> | 

<a name="module_functions.insertBefore"></a>

### functions.insertBefore(child, ref) ⇒ <code>HTMLElement</code>
Inserts the child element before the reference

**Kind**: static method of <code>[functions](#module_functions)</code>  
**Returns**: <code>HTMLElement</code> - The child  

| Param | Type |
| --- | --- |
| child | <code>HTMLElement</code> | 
| ref | <code>HTMLElement</code> | 

<a name="module_functions.isArray"></a>

### functions.isArray(src) ⇒ <code>Boolean</code>
Checks if the src is an array

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| src | <code>\*</code> | 

<a name="module_functions.isArticleAdSlot"></a>

### functions.isArticleAdSlot(placement) ⇒ <code>Boolean</code>
Checks if the placement is in an article slot

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| placement | <code>String</code> | 

<a name="module_functions.isDefined"></a>

### functions.isDefined(value) ⇒ <code>Boolean</code>
Checks if a value is defined

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

<a name="module_functions.isEmptyString"></a>

### functions.isEmptyString(value) ⇒ <code>Boolean</code>
Checks if the value is an empty string

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

<a name="module_functions.isElement"></a>

### functions.isElement(value) ⇒ <code>Boolean</code>
Checks if the value is an element

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

<a name="module_functions.isHeaderAdSlot"></a>

### functions.isHeaderAdSlot(placement) ⇒ <code>Boolean</code>
Checks if the placement is a header slot

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| placement | <code>String</code> | 

<a name="module_functions.isObject"></a>

### functions.isObject(src) ⇒ <code>Boolean</code>
Checks if the src is an object

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| src | <code>\*</code> | 

<a name="module_functions.isSplashAdSlot"></a>

### functions.isSplashAdSlot(placement) ⇒ <code>Boolean</code>
Checks if the placement is a splash slot

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| placement | <code>String</code> | 

<a name="module_functions.isWindow"></a>

### functions.isWindow(win) ⇒ <code>Boolean</code>
Checks if win is a window element

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| win | <code>\*</code> | 

<a name="module_functions.loadScript"></a>

### functions.loadScript(url, options) ⇒ <code>Promise</code>
Loads a script file into the page

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| url | <code>String</code> | 
| options | <code>Object</code> | 

<a name="module_functions.loadSocialScripts"></a>

### functions.loadSocialScripts() ⇒ <code>Promise</code>
Loads any social scripts. Includes twitter, facebook, vine, instagram
and imgur

**Kind**: static method of <code>[functions](#module_functions)</code>  
<a name="module_functions.not"></a>

### functions.not(value) ⇒ <code>Boolean</code>
Inverts the value

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

<a name="module_functions.onPageLoad"></a>

### functions.onPageLoad(loadFn)
Runs loadFn once the page has loaded

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| loadFn | <code>function</code> | 

<a name="module_functions.onPageReady"></a>

### functions.onPageReady(readyFn)
Runs readyFn once the page is ready

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| readyFn | <code>function</code> | 

<a name="module_functions.padValue"></a>

### functions.padValue(value, width, chr) ⇒ <code>String</code>
Pads a number

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| value | <code>Number</code> | 
| width | <code>Number</code> | 
| chr | <code>String</code> | 

<a name="module_functions.randomUUID"></a>

### functions.randomUUID() ⇒ <code>String</code>
Generates a random id

**Kind**: static method of <code>[functions](#module_functions)</code>  
<a name="module_functions.removeClass"></a>

### functions.removeClass(el, cls)
Removes a class from an element

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 
| cls | <code>String</code> | 

<a name="module_functions.removeElement"></a>

### functions.removeElement(el)
Removes the element from the tree

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLElement</code> | 

<a name="module_functions.removeEvent"></a>

### functions.removeEvent(el, type, fn)
Removes an event from an element

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 
| type | <code>String</code> | 
| fn | <code>function</code> | 

<a name="module_functions.throttle"></a>

### functions.throttle(fn, threshhold, scope) ⇒ <code>function</code>
Throttles an event being fired by the threshold

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> |  |
| threshhold | <code>Number</code> | Milliseconds to throttle by |
| scope | <code>Object</code> |  |

<a name="module_functions.toBoolean"></a>

### functions.toBoolean(value) ⇒ <code>Boolean</code>
Converts a value to a boolean

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

<a name="module_functions.toggleClass"></a>

### functions.toggleClass(el, cls)
Toggles a class on an element

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| el | <code>HTMLNode</code> | 
| cls | <code>String</code> | 

<a name="module_functions.unescapeJinjaValue"></a>

### functions.unescapeJinjaValue(value) ⇒ <code>\*</code>
Unescapes a value from jinja

**Kind**: static method of <code>[functions](#module_functions)</code>  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

