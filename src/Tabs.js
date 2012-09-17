/**
 * Titon: The Mootools UI/Utility Framework
 *
 * @copyright	Copyright 2010+, Titon
 * @link		http://github.com/titon
 * @license		http://opensource.org/licenses/bsd-license.php (BSD License)
 */

/**
 * Provides tabbed support to an element containing navigation tabs and sections.
 * Each time a tab is clicked, the section with the same ID as the tab href will be displayed.
 *
 * {{{
 * 		<div id="tabs">
 *			<nav>
 *				<ul>
 *					<li><a href="#tab-1">Tab 1</a></li>
 *					<li><a href="#tab-2">Tab 2</a></li>
 *				</ul>
 *			</nav>
 *
 *			<section id="tab-1"></section>
 *			<section id="tab-2"></section>
 * 		</div>
 *
 * 		<script>
 *			var tabs = Titon.Tabs.factory('tabs', {});
 * 		</script>
 * }}}
 *
 * @version	0.5
 * @uses	Titon
 * @uses	Titon.Module
 * @uses	Core
 */
Titon.Tabs = new Titon.Module({

	/**
	 * Collection of content sections.
	 */
	sections: [],

	/**
	 * Collection of tabs (anchor links).
	 */
	tabs: [],

	/**
	 * The current and previous shown indices.
	 */
	previousIndex: 0,
	currentIndex: 0,

	/**
	 * Query selector used for node targeting.
	 */
	query: null,

	/**
	 * Default options.
	 *
	 *	fade			- (bool) Should the sections fade in
	 *	fadeDuration	- (int) Fade duration in milliseconds
	 *	activeClass		- (string) Class name appended to the active tab
	 *	defaultIndex	- (int) Index of the tab/section to display by default
	 *	persistState	- (bool) Will persist the last tab clicked between page loads
	 *	cookie			- (string) The key used in the cookie name
	 *	cookieDuration	- (int) The length the cookie will last (in days)
	 *	onShow			- (function) Callback to trigger when a section is shown
	 *	tabsElement		- (string) The CSS query to grab the tab elements
	 *	sectionsElement	- (string) The CSS query to grab the section elements
	 *	template		- (string) Do not use an HTML template
	 */
	options: {
		fade: false,
		fadeDuration: 600,
		activeClass: Titon.options.activeClass,
		defaultIndex: 0,
		persistState: false,
		cookie: null,
		cookieDuration: 30,
		onShow: null,
		tabsElement: 'nav a',
		sectionsElement: 'section',
		template: false
	},

	/**
	 * Initialize Tabs by storing the query, gathering the elements and binding events.
	 *
	 * @param {string} query
	 * @param {object} options
	 */
	initialize: function(query, options) {
		this.parent(options);
		this.query = query;

		this.options.cookie = (this.options.cookie || this.query).camelCase();

		// Get elements
		this.element = $(query);

		this.tabs = this.element.getElements(this.options.tabsElement);
		this.tabs.each(function(tab, index) {
			tab.set('data-tabs-index', index).removeClass(this.options.activeClass);
		}.bind(this));

		this.sections = this.element.getElements(this.options.sectionsElement);
		this.sections.hide();

		// Set events
		this.tabs.addEvent('click', this.listen.bind(this));

		// Trigger default tab to display
		var index = Number.from(Cookie.read('titon.tabs.' + this.options.cookie) || this.options.defaultIndex);

		this.show(index);
	},

	/**
	 * Event callback for tab element click.
	 *
	 * @param {event} e
	 */
	listen: function(e) {
		e.stop();

		this.show(e.target);
	},

	/**
	 * Show the content based on the tab. Can either pass an integer as the index in the collection,
	 * or pass an element object for a tab in the collection.
	 *
	 * @param {object|int} tab
	 */
	show: function(tab) {
		if (typeOf(tab) === 'number') {
			tab = this.tabs[tab] || null;
		}

		if (!tab) {
			return;
		}

		var className = this.options.activeClass,
			target = (tab.get('data-tabs-target') || tab.get('href')).remove('#');

		// Toggle tabs
		this.tabs.removeClass(className);

		tab.addClass(className);

		// Toggle sections
		this.sections.hide();

		if (this.options.fade) {
			$(target).fadeIn(this.options.fadeDuration)
		} else {
			$(target).show();
		}

		// Persist the state using a cookie
		if (this.options.persistState) {
			Cookie.write('titon.tabs.' + this.options.cookie, tab.get('data-tabs-index'), {
				duration: this.options.cookieDuration
			});
		}

		// Track
		this.previousIndex = this.currentIndex;
		this.currentIndex = tab.get('data-tabs-index');

		this.fireEvent('show', tab);
	}

});

/**
 * All instances loaded via factory().
 */
Titon.Tabs.instances = {};

/**
 * Easily create multiple Tabs instances.
 *
 * @param {string} query
 * @param {object} options
 */
Titon.Tabs.factory = function(query, options) {
	if (Titon.Tabs.instances[query]) {
		return Titon.Tabs.instances[query];
	}

	var instance = new Titon.Tabs(query, options);

	Titon.Tabs.instances[query] = instance;

	return instance;
};