const __pluginConfig =  {
  "name": "windy-plugin-croatian-buoys",
  "version": "0.1.0",
  "icon": "⚓",
  "title": "Croatian Met-ocean Buoys",
  "description": "Live DHMZ meteorological and oceanographic charts from five Croatian Adriatic buoys.",
  "author": "Community plugin",
  "repository": "https://github.com/kikomle/dhmz-weather-buoys-windy",
  "desktopUI": "rhpane",
  "desktopWidth": 620,
  "mobileUI": "fullscreen",
  "routerPath": "/croatian-buoys",
  "private": true,
  "built": 1787311190335,
  "builtReadable": "2026-08-21T11:19:50.335Z",
  "screenshot": "screenshot.jpg"
};

// transformCode: import bcast from '@windy/broadcast';
const bcast = W.broadcast;

// transformCode: import { map } from '@windy/map';
const { map } = W.map;


/** @returns {void} */
function noop() {}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

let src_url_equal_anchor;

/**
 * @param {string} element_src
 * @param {string} url
 * @returns {boolean}
 */
function src_url_equal(element_src, url) {
	if (element_src === url) return true;
	if (!src_url_equal_anchor) {
		src_url_equal_anchor = document.createElement('a');
	}
	// This is actually faster than doing URL(..).href
	src_url_equal_anchor.href = url;
	return element_src === src_url_equal_anchor.href;
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {string} style_sheet_id
 * @param {string} styles
 * @returns {void}
 */
function append_styles(target, style_sheet_id, styles) {
	const append_styles_to = get_root_for_style(target);
	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_stylesheet(append_styles_to, style);
	}
}

/**
 * @param {Node} node
 * @returns {ShadowRoot | Document}
 */
function get_root_for_style(node) {
	if (!node) return document;
	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && /** @type {ShadowRoot} */ (root).host) {
		return /** @type {ShadowRoot} */ (root);
	}
	return node.ownerDocument;
}

/**
 * @param {ShadowRoot | Document} node
 * @param {HTMLStyleElement} style
 * @returns {CSSStyleSheet}
 */
function append_stylesheet(node, style) {
	append(/** @type {Document} */ (node).head || node, style);
	return style.sheet;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @returns {void} */
function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data(text, data) {
	data = '' + data;
	if (text.data === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @returns {void} */
function toggle_class(element, name, toggle) {
	// The `!!` is required because an `undefined` flag means flipping the current state.
	element.classList.toggle(name, !!toggle);
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs/svelte#onmount
 * @template T
 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs/svelte#ondestroy
 * @param {() => any} fn
 * @returns {void}
 */
function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

const outroing = new Set();

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

// TODO: Document the other params
/**
 * @param {SvelteComponent} component
 * @param {import('./public.js').ComponentConstructorOptions} options
 *
 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
 * This will be the `add_css` function from the compiled component.
 *
 * @returns {void}
 */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles = null,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			// TODO: what is the correct type here?
			// @ts-expect-error
			const nodes = children(options.target);
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		flush();
	}
	set_current_component(parent_component);
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 */
class SvelteComponent {
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$ = undefined;
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$set = undefined;

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

// generated during release, do not modify

const PUBLIC_VERSION = '4';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

const chartBaseUrl = 'https://vrijeme.hr/plutace';
// WGS84 positions and mooring depths published for the Croatian state
// meteorological-oceanographic buoy network (Narodne novine 5/2026).
const buoys = [
    {
        id: 'Kvarner',
        name: 'Kvarner',
        lat: 44.6916,
        lon: 14.151944,
        mooringDepth: 48.3,
        chartUrl: `${chartBaseUrl}/plutaca-Kvarner-en.png`
    },
    {
        id: 'Blitvenica',
        name: 'Blitvenica',
        lat: 43.598064,
        lon: 15.569719,
        mooringDepth: 211.3,
        chartUrl: `${chartBaseUrl}/plutaca-Blitvenica-en.png`
    },
    {
        id: 'Viski_kanal',
        name: 'Viški kanal',
        lat: 43.146294,
        lon: 16.112647,
        mooringDepth: 104.5,
        chartUrl: `${chartBaseUrl}/plutaca-Viski_kanal-en.png`
    },
    {
        id: 'Palagruza',
        name: 'Palagruža',
        lat: 42.489547,
        lon: 16.401208,
        mooringDepth: 188.5,
        chartUrl: `${chartBaseUrl}/plutaca-Palagruza-en.png`
    },
    {
        id: 'Molunat',
        name: 'Molunat',
        lat: 42.394317,
        lon: 18.358931,
        mooringDepth: 154,
        chartUrl: `${chartBaseUrl}/plutaca-Molunat-en.png`
    }
];
const networkCenter = {
    lat: 43.45,
    lon: 16.2
};
const dhmzSourceUrl = 'https://meteo.hr/podaci_e.php?section=podaci_vrijeme&param=mop';
const waveReadingsUrl = 'https://kikomle.github.io/dhmz-weather-buoys-windy/buoy-readings.json';

const config = {
    title: 'Croatian Met-ocean Buoys'};

/* src/plugin.svelte generated by Svelte v4.2.20 */

function add_css(target) {
	append_styles(target, "svelte-zgskb6", ".buoy-plugin.svelte-zgskb6.svelte-zgskb6{--navy:#0a2638;--navy-soft:#163d53;--sea:#0d8aa5;--aqua:#8ee3e8;--foam:#eef9f8;--signal:#ffd747;--ink-muted:#5f717a;--line:#d9e5e8;color:var(--navy);padding-bottom:24px}.intro.svelte-zgskb6.svelte-zgskb6{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin:18px 0 16px}.intro__copy.svelte-zgskb6.svelte-zgskb6{max-width:310px;margin:5px 0 0;color:var(--ink-muted);font-size:14px;line-height:1.45}.eyebrow.svelte-zgskb6.svelte-zgskb6{color:var(--sea);font-size:11px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase}.map-button.svelte-zgskb6.svelte-zgskb6,.refresh-button.svelte-zgskb6.svelte-zgskb6,.station-pill.svelte-zgskb6.svelte-zgskb6,.view-toggle.svelte-zgskb6 button.svelte-zgskb6{border:0;font:inherit;cursor:pointer}.map-button.svelte-zgskb6.svelte-zgskb6{display:inline-flex;flex:0 0 auto;align-items:center;gap:6px;padding:8px 10px;border:1px solid var(--line);border-radius:9px;background:white;color:var(--navy-soft);font-size:12px;font-weight:600}.map-button.svelte-zgskb6.svelte-zgskb6:hover{border-color:var(--sea)}.station-strip.svelte-zgskb6.svelte-zgskb6{display:flex;gap:7px;margin:0 -10px 16px;padding:1px 10px 8px;overflow-x:auto;scrollbar-width:thin}.station-pill.svelte-zgskb6.svelte-zgskb6{display:inline-flex;flex:0 0 auto;align-items:center;gap:7px;min-height:36px;padding:0 12px;border:1px solid var(--line);border-radius:999px;background:#f7fafb;color:var(--navy-soft);font-size:12px;font-weight:600}.station-pill__dot.svelte-zgskb6.svelte-zgskb6{width:7px;height:7px;border-radius:50%;background:#9cabb1}.station-pill.svelte-zgskb6.svelte-zgskb6:hover{border-color:#9ec9d2;background:white}.station-pill.is-selected.svelte-zgskb6.svelte-zgskb6{border-color:var(--navy);background:var(--navy);color:white}.station-pill.is-selected.svelte-zgskb6 .station-pill__dot.svelte-zgskb6{background:var(--signal);box-shadow:0 0 0 3px rgba(255, 215, 71, 0.18)}.observation-card.svelte-zgskb6.svelte-zgskb6{overflow:hidden;border:1px solid #ccdde1;border-radius:14px;background:white;box-shadow:0 8px 25px rgba(10, 38, 56, 0.09)}.observation-card__header.svelte-zgskb6.svelte-zgskb6{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:16px 16px 13px;background:linear-gradient(145deg, #f8fcfc 0%, #eaf7f7 100%)}.observation-card__header.svelte-zgskb6 h2.svelte-zgskb6{margin:4px 0 3px;color:var(--navy);font-size:23px;font-weight:650;line-height:1.15}.observation-card__header.svelte-zgskb6 p.svelte-zgskb6{margin:0;color:var(--ink-muted);font-size:11px;line-height:1.45}.observation-card__footer.svelte-zgskb6.svelte-zgskb6{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 14px;border-top:1px solid var(--line);color:var(--ink-muted);font-size:11px}.observation-card__footer.svelte-zgskb6 a.svelte-zgskb6{color:var(--sea);font-weight:700;text-decoration:none}.observation-card__actions.svelte-zgskb6.svelte-zgskb6{display:flex;flex:0 0 auto;align-items:center;gap:9px}.wave-summary.svelte-zgskb6.svelte-zgskb6{min-width:94px;padding:7px 10px;border:1px solid #a8d7df;border-radius:10px;background:white;text-align:right}.wave-summary.svelte-zgskb6 span.svelte-zgskb6,.wave-summary.svelte-zgskb6 strong.svelte-zgskb6{display:block}.wave-summary.svelte-zgskb6 span.svelte-zgskb6{color:var(--ink-muted);font-size:9px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase}.wave-summary.svelte-zgskb6 strong.svelte-zgskb6{margin-top:2px;color:var(--sea);font-size:19px;line-height:1}.wave-summary.is-unavailable.svelte-zgskb6 strong.svelte-zgskb6{color:var(--ink-muted);font-size:14px}.live-label.svelte-zgskb6.svelte-zgskb6{display:inline-flex;align-items:center;gap:6px;color:var(--sea);font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase}.live-label.svelte-zgskb6 span.svelte-zgskb6{width:7px;height:7px;border-radius:50%;background:#35b779;box-shadow:0 0 0 3px rgba(53, 183, 121, 0.15)}.refresh-button.svelte-zgskb6.svelte-zgskb6{display:grid;flex:0 0 34px;width:34px;height:34px;place-items:center;border:1px solid #c9dfe2;border-radius:50%;background:white;color:var(--sea);font-size:22px;line-height:1}.refresh-button.svelte-zgskb6.svelte-zgskb6:hover{border-color:var(--sea)}.refresh-button.is-loading.svelte-zgskb6.svelte-zgskb6{animation:svelte-zgskb6-spin 1s linear infinite}.chart-toolbar.svelte-zgskb6.svelte-zgskb6{display:flex;align-items:center;justify-content:space-between;min-height:38px;padding:0 12px 0 14px;border-top:1px solid rgba(204, 221, 225, 0.7);border-bottom:1px solid var(--line);color:var(--ink-muted);font-size:11px}.view-toggle.svelte-zgskb6.svelte-zgskb6{display:inline-flex;padding:2px;border-radius:7px;background:#e7eff1}.view-toggle.svelte-zgskb6 button.svelte-zgskb6{padding:4px 7px;border-radius:5px;background:transparent;color:var(--ink-muted);font-size:10px}.view-toggle.svelte-zgskb6 button.is-active.svelte-zgskb6{background:white;color:var(--navy);box-shadow:0 1px 3px rgba(10, 38, 56, 0.15)}.chart-viewport.svelte-zgskb6.svelte-zgskb6{position:relative;min-height:300px;max-height:min(70vh, 760px);overflow:auto;overscroll-behavior:contain;scrollbar-color:#72aebc #e7f0f2;scrollbar-width:auto;background:linear-gradient(90deg, rgba(220, 235, 237, 0.3) 1px, transparent 1px) 0 0px 18px, linear-gradient(rgba(220, 235, 237, 0.3) 1px, transparent 1px) 0 0px 18px, #fbfdfd}.chart-viewport.svelte-zgskb6 img.svelte-zgskb6{display:block;width:100%;height:auto;background:white}.chart-viewport.is-full.svelte-zgskb6 img.svelte-zgskb6{width:997px;max-width:none}.chart-viewport.svelte-zgskb6 img.is-hidden.svelte-zgskb6{display:none}.chart-error.svelte-zgskb6.svelte-zgskb6{display:flex;min-height:180px;flex-direction:column;align-items:center;justify-content:center;padding:24px;color:var(--ink-muted);text-align:center}.chart-error.svelte-zgskb6>span.svelte-zgskb6{display:grid;width:45px;height:45px;margin-bottom:12px;place-items:center;border-radius:50%;background:#dff2f3;color:var(--sea);font-size:26px}.chart-error.svelte-zgskb6 strong.svelte-zgskb6{color:var(--navy)}.chart-error.svelte-zgskb6 p.svelte-zgskb6{margin:5px 0 0;font-size:12px}.notice.svelte-zgskb6.svelte-zgskb6{display:flex;gap:10px;margin-top:14px;padding:12px 13px;border:1px solid #efd989;border-radius:10px;background:#fff9df}.notice__icon.svelte-zgskb6.svelte-zgskb6{display:grid;flex:0 0 20px;width:20px;height:20px;place-items:center;border-radius:50%;background:var(--signal);color:#4c4000;font-size:12px;font-weight:800}.notice.svelte-zgskb6 p.svelte-zgskb6{margin:0;color:#635923;font-size:11px;line-height:1.5}.source-line.svelte-zgskb6.svelte-zgskb6{margin:14px 2px 0;color:var(--ink-muted);font-size:11px;line-height:1.45}.source-line.svelte-zgskb6 a.svelte-zgskb6{color:var(--sea);font-weight:600;text-decoration:none}.dhmz-buoy-marker{position:relative;width:140px !important;height:102px !important;border:0;background:transparent;filter:drop-shadow(0 5px 8px rgba(7, 45, 65, 0.26))}.dhmz-buoy-marker__halo{position:absolute;top:-7px;left:-7px;width:70px;height:70px;border-radius:50%;background:rgba(99, 219, 119, 0.24);animation:svelte-zgskb6-buoy-pulse 2.5s ease-out infinite}.dhmz-buoy-marker__ring{position:absolute;top:0;left:0;width:56px;height:56px;box-sizing:border-box;border:2px solid rgba(255, 255, 255, 0.92);border-radius:50%;background:repeating-conic-gradient(from -8deg, #63dd67 0deg 14deg, #1a9b55 14deg 20deg);box-shadow:0 3px 12px rgba(7, 45, 65, 0.4), inset 0 0 0 1px rgba(6, 100, 74, 0.3);transition:transform 0.18s ease}.dhmz-buoy-marker__ring::before{position:absolute;inset:10px;border-radius:50%;background:white;content:''}.dhmz-buoy-marker__core{position:absolute;inset:15px;border:3px solid #2b8aae;border-radius:50%;background:#ecfbff;box-shadow:inset 0 0 0 2px white}.dhmz-buoy-marker__label{position:absolute;top:49px;left:18px;display:inline-flex;min-width:88px;min-height:48px;box-sizing:border-box;flex-direction:column;align-items:flex-start;justify-content:center;gap:3px;padding:6px 11px 7px 10px;border:2px solid rgba(255, 255, 255, 0.72);border-radius:12px;background:linear-gradient(145deg, #2f8daf, #237495);color:white;font-size:13px;font-weight:750;line-height:1;text-shadow:0 1px 1px rgba(7, 45, 65, 0.28);white-space:nowrap;transition:background 0.18s ease, transform 0.18s ease}.dhmz-buoy-marker__station{max-width:108px;overflow:hidden;color:#d9fbff;font-size:9px;font-weight:750;letter-spacing:0.07em;line-height:1;text-overflow:ellipsis;text-transform:uppercase}.dhmz-buoy-marker__reading{display:inline-flex;align-items:center;gap:5px}.dhmz-buoy-marker__reading strong.svelte-zgskb6.svelte-zgskb6{font-size:18px;font-weight:800;letter-spacing:-0.02em}.dhmz-buoy-marker__arrow{color:#d9fbff;font-size:12px;transform:rotate(24deg)}.dhmz-buoy-marker:hover .dhmz-buoy-marker__ring,.dhmz-buoy-marker.is-selected .dhmz-buoy-marker__ring{transform:scale(1.1)}.dhmz-buoy-marker:hover .dhmz-buoy-marker__label,.dhmz-buoy-marker.is-selected .dhmz-buoy-marker__label{background:linear-gradient(145deg, #127f9d, #0a607d);transform:translateY(3px) scale(1.04)}.dhmz-buoy-marker.is-selected .dhmz-buoy-marker__halo{background:rgba(142, 227, 232, 0.35);animation-duration:1.6s}@keyframes svelte-zgskb6-spin{to{transform:rotate(360deg)}}@keyframes svelte-zgskb6-buoy-pulse{0%{opacity:0.9;transform:scale(0.75)}70%,100%{opacity:0;transform:scale(1.4)}}@media(max-width: 430px){.intro.svelte-zgskb6.svelte-zgskb6{margin-top:14px}.observation-card.svelte-zgskb6.svelte-zgskb6{border-radius:12px}.chart-viewport.svelte-zgskb6.svelte-zgskb6{min-height:280px;max-height:65vh}}@media(prefers-reduced-motion: reduce){.refresh-button.is-loading.svelte-zgskb6.svelte-zgskb6,.dhmz-buoy-marker__halo{animation:none}}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[39] = list[i];
	return child_ctx;
}

// (28:8) {#each buoys as buoy}
function create_each_block(ctx) {
	let button;
	let span0;
	let t0;
	let span1;
	let t2;
	let button_aria_pressed_value;
	let mounted;
	let dispose;

	function click_handler_1() {
		return /*click_handler_1*/ ctx[22](/*buoy*/ ctx[39]);
	}

	return {
		c() {
			button = element("button");
			span0 = element("span");
			t0 = space();
			span1 = element("span");
			span1.textContent = `${/*buoy*/ ctx[39].name}`;
			t2 = space();
			attr(span0, "class", "station-pill__dot svelte-zgskb6");
			attr(span0, "aria-hidden", "true");
			attr(button, "class", "station-pill svelte-zgskb6");
			attr(button, "type", "button");
			attr(button, "aria-pressed", button_aria_pressed_value = /*selectedBuoy*/ ctx[0].id === /*buoy*/ ctx[39].id);
			toggle_class(button, "is-selected", /*selectedBuoy*/ ctx[0].id === /*buoy*/ ctx[39].id);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, span0);
			append(button, t0);
			append(button, span1);
			append(button, t2);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_1);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*selectedBuoy*/ 1 && button_aria_pressed_value !== (button_aria_pressed_value = /*selectedBuoy*/ ctx[0].id === /*buoy*/ ctx[39].id)) {
				attr(button, "aria-pressed", button_aria_pressed_value);
			}

			if (dirty[0] & /*selectedBuoy*/ 1) {
				toggle_class(button, "is-selected", /*selectedBuoy*/ ctx[0].id === /*buoy*/ ctx[39].id);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (94:12) {#if chartFailed}
function create_if_block(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.innerHTML = `<span aria-hidden="true" class="svelte-zgskb6">≈</span> <strong class="svelte-zgskb6">The DHMZ chart could not be loaded.</strong> <p class="svelte-zgskb6">Try refreshing, or open the source page below.</p>`;
			attr(div, "class", "chart-error svelte-zgskb6");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function create_fragment(ctx) {
	let div0;
	let t1;
	let section;
	let div1;
	let t3;
	let div3;
	let div2;
	let t7;
	let button0;
	let t10;
	let div4;
	let t11;
	let article;
	let header;
	let div5;
	let span3;
	let t13;
	let h2;
	let t14_value = /*selectedBuoy*/ ctx[0].name + "";
	let t14;
	let t15;
	let p1;
	let t16_value = /*formatCoordinate*/ ctx[9](/*selectedBuoy*/ ctx[0].lat, 'N', 'S') + "";
	let t16;
	let t17;
	let t18_value = /*formatCoordinate*/ ctx[9](/*selectedBuoy*/ ctx[0].lon, 'E', 'W') + "";
	let t18;
	let t19;
	let t20_value = /*selectedBuoy*/ ctx[0].mooringDepth.toFixed(1) + "";
	let t20;
	let t21;
	let t22;
	let div7;
	let div6;
	let span4;
	let t24;
	let strong;
	let t25_value = /*formatWaveHeight*/ ctx[11](/*selectedReading*/ ctx[1]) + "";
	let t25;
	let t26;
	let button1;
	let t28;
	let div9;
	let span5;

	let t29_value = (/*imageLoading*/ ctx[4]
	? 'Loading latest chart…'
	: /*viewMode*/ ctx[6] === 'full'
		? 'Full size · scroll to explore'
		: `Checked ${/*formatCheckedAt*/ ctx[10](/*lastChecked*/ ctx[5])}`) + "";

	let t29;
	let t30;
	let div8;
	let button2;
	let t32;
	let button3;
	let t34;
	let div10;
	let t35;
	let img;
	let img_src_value;
	let img_alt_value;
	let t36;
	let footer;
	let span6;
	let t37_value = /*formatWaveReadingStatus*/ ctx[12](/*selectedReading*/ ctx[1]) + "";
	let t37;
	let t38;
	let a0;
	let t39;
	let a0_href_value;
	let t40;
	let div11;
	let t44;
	let p3;
	let mounted;
	let dispose;
	let each_value = ensure_array_like(buoys);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	let if_block = /*chartFailed*/ ctx[3] && create_if_block();

	return {
		c() {
			div0 = element("div");
			div0.textContent = `${/*title*/ ctx[8]}`;
			t1 = space();
			section = element("section");
			div1 = element("div");
			div1.textContent = `${/*title*/ ctx[8]}`;
			t3 = space();
			div3 = element("div");
			div2 = element("div");

			div2.innerHTML = `<span class="eyebrow svelte-zgskb6">DHMZ observations</span> <p class="intro__copy svelte-zgskb6">Live charts from five Croatian Adriatic buoys. Map badges show the latest
                significant wave height.</p>`;

			t7 = space();
			button0 = element("button");

			button0.innerHTML = `<span aria-hidden="true">⌖</span>
            All buoys`;

			t10 = space();
			div4 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t11 = space();
			article = element("article");
			header = element("header");
			div5 = element("div");
			span3 = element("span");
			span3.innerHTML = `<span aria-hidden="true" class="svelte-zgskb6"></span> Official chart`;
			t13 = space();
			h2 = element("h2");
			t14 = text(t14_value);
			t15 = space();
			p1 = element("p");
			t16 = text(t16_value);
			t17 = text(" ·\n                    ");
			t18 = text(t18_value);
			t19 = text(" ·\n                    ");
			t20 = text(t20_value);
			t21 = text(" m mooring depth");
			t22 = space();
			div7 = element("div");
			div6 = element("div");
			span4 = element("span");
			span4.textContent = "Significant waves";
			t24 = space();
			strong = element("strong");
			t25 = text(t25_value);
			t26 = space();
			button1 = element("button");
			button1.textContent = "↻";
			t28 = space();
			div9 = element("div");
			span5 = element("span");
			t29 = text(t29_value);
			t30 = space();
			div8 = element("div");
			button2 = element("button");
			button2.textContent = "Fit";
			t32 = space();
			button3 = element("button");
			button3.textContent = "100%";
			t34 = space();
			div10 = element("div");
			if (if_block) if_block.c();
			t35 = space();
			img = element("img");
			t36 = space();
			footer = element("footer");
			span6 = element("span");
			t37 = text(t37_value);
			t38 = space();
			a0 = element("a");
			t39 = text("Open full chart ↗");
			t40 = space();
			div11 = element("div");

			div11.innerHTML = `<span class="notice__icon svelte-zgskb6" aria-hidden="true">i</span> <p class="svelte-zgskb6">DHMZ publishes original, uncontrolled measurements. Values may be missing or may
            deviate from actual conditions; do not use this display as the sole source for
            safety-critical decisions.</p>`;

			t44 = space();
			p3 = element("p");

			p3.innerHTML = `Data and charts:
        <a href="${dhmzSourceUrl}" target="_blank" rel="noreferrer" class="svelte-zgskb6">Croatian Meteorological and Hydrological Service (DHMZ) ↗</a>`;

			attr(div0, "class", "plugin__mobile-header");
			attr(div1, "class", "plugin__title plugin__title--chevron-back");
			attr(button0, "class", "map-button svelte-zgskb6");
			attr(button0, "type", "button");
			attr(button0, "title", "Show all buoys");
			attr(div3, "class", "intro svelte-zgskb6");
			attr(div4, "class", "station-strip svelte-zgskb6");
			attr(div4, "aria-label", "Select a buoy");
			attr(span3, "class", "live-label svelte-zgskb6");
			attr(h2, "class", "svelte-zgskb6");
			attr(p1, "class", "svelte-zgskb6");
			attr(span4, "class", "svelte-zgskb6");
			attr(strong, "class", "svelte-zgskb6");
			attr(div6, "class", "wave-summary svelte-zgskb6");
			toggle_class(div6, "is-unavailable", !/*hasSelectedWaveReading*/ ctx[7]);
			attr(button1, "class", "refresh-button svelte-zgskb6");
			attr(button1, "type", "button");
			attr(button1, "aria-label", "Refresh the buoy chart and wave reading");
			attr(button1, "title", "Refresh chart and wave reading");
			toggle_class(button1, "is-loading", /*imageLoading*/ ctx[4]);
			attr(div7, "class", "observation-card__actions svelte-zgskb6");
			attr(header, "class", "observation-card__header svelte-zgskb6");
			attr(button2, "type", "button");
			attr(button2, "class", "svelte-zgskb6");
			toggle_class(button2, "is-active", /*viewMode*/ ctx[6] === 'fit');
			attr(button3, "type", "button");
			attr(button3, "class", "svelte-zgskb6");
			toggle_class(button3, "is-active", /*viewMode*/ ctx[6] === 'full');
			attr(div8, "class", "view-toggle svelte-zgskb6");
			attr(div8, "aria-label", "Chart size");
			attr(div9, "class", "chart-toolbar svelte-zgskb6");
			if (!src_url_equal(img.src, img_src_value = /*chartSrc*/ ctx[2])) attr(img, "src", img_src_value);
			attr(img, "alt", img_alt_value = `Latest DHMZ meteorological and oceanographic observations for ${/*selectedBuoy*/ ctx[0].name}`);
			attr(img, "class", "svelte-zgskb6");
			toggle_class(img, "is-hidden", /*chartFailed*/ ctx[3]);
			attr(div10, "class", "chart-viewport svelte-zgskb6");
			toggle_class(div10, "is-full", /*viewMode*/ ctx[6] === 'full');
			attr(a0, "href", a0_href_value = /*selectedBuoy*/ ctx[0].chartUrl);
			attr(a0, "target", "_blank");
			attr(a0, "rel", "noreferrer");
			attr(a0, "class", "svelte-zgskb6");
			attr(footer, "class", "observation-card__footer svelte-zgskb6");
			attr(article, "class", "observation-card svelte-zgskb6");
			attr(div11, "class", "notice svelte-zgskb6");
			attr(p3, "class", "source-line svelte-zgskb6");
			attr(section, "class", "plugin__content buoy-plugin svelte-zgskb6");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			insert(target, t1, anchor);
			insert(target, section, anchor);
			append(section, div1);
			append(section, t3);
			append(section, div3);
			append(div3, div2);
			append(div3, t7);
			append(div3, button0);
			append(section, t10);
			append(section, div4);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div4, null);
				}
			}

			append(section, t11);
			append(section, article);
			append(article, header);
			append(header, div5);
			append(div5, span3);
			append(div5, t13);
			append(div5, h2);
			append(h2, t14);
			append(div5, t15);
			append(div5, p1);
			append(p1, t16);
			append(p1, t17);
			append(p1, t18);
			append(p1, t19);
			append(p1, t20);
			append(p1, t21);
			append(header, t22);
			append(header, div7);
			append(div7, div6);
			append(div6, span4);
			append(div6, t24);
			append(div6, strong);
			append(strong, t25);
			append(div7, t26);
			append(div7, button1);
			append(article, t28);
			append(article, div9);
			append(div9, span5);
			append(span5, t29);
			append(div9, t30);
			append(div9, div8);
			append(div8, button2);
			append(div8, t32);
			append(div8, button3);
			append(article, t34);
			append(article, div10);
			if (if_block) if_block.m(div10, null);
			append(div10, t35);
			append(div10, img);
			append(article, t36);
			append(article, footer);
			append(footer, span6);
			append(span6, t37);
			append(footer, t38);
			append(footer, a0);
			append(a0, t39);
			append(section, t40);
			append(section, div11);
			append(section, t44);
			append(section, p3);

			if (!mounted) {
				dispose = [
					listen(div1, "click", /*click_handler*/ ctx[21]),
					listen(button0, "click", /*showAllBuoys*/ ctx[15]),
					listen(button1, "click", /*refreshAllData*/ ctx[13]),
					listen(button2, "click", /*click_handler_2*/ ctx[23]),
					listen(button3, "click", /*click_handler_3*/ ctx[24]),
					listen(img, "load", /*handleChartLoaded*/ ctx[16]),
					listen(img, "error", /*handleChartError*/ ctx[17])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedBuoy, selectBuoy*/ 16385) {
				each_value = ensure_array_like(buoys);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div4, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty[0] & /*selectedBuoy*/ 1 && t14_value !== (t14_value = /*selectedBuoy*/ ctx[0].name + "")) set_data(t14, t14_value);
			if (dirty[0] & /*selectedBuoy*/ 1 && t16_value !== (t16_value = /*formatCoordinate*/ ctx[9](/*selectedBuoy*/ ctx[0].lat, 'N', 'S') + "")) set_data(t16, t16_value);
			if (dirty[0] & /*selectedBuoy*/ 1 && t18_value !== (t18_value = /*formatCoordinate*/ ctx[9](/*selectedBuoy*/ ctx[0].lon, 'E', 'W') + "")) set_data(t18, t18_value);
			if (dirty[0] & /*selectedBuoy*/ 1 && t20_value !== (t20_value = /*selectedBuoy*/ ctx[0].mooringDepth.toFixed(1) + "")) set_data(t20, t20_value);
			if (dirty[0] & /*selectedReading*/ 2 && t25_value !== (t25_value = /*formatWaveHeight*/ ctx[11](/*selectedReading*/ ctx[1]) + "")) set_data(t25, t25_value);

			if (dirty[0] & /*hasSelectedWaveReading*/ 128) {
				toggle_class(div6, "is-unavailable", !/*hasSelectedWaveReading*/ ctx[7]);
			}

			if (dirty[0] & /*imageLoading*/ 16) {
				toggle_class(button1, "is-loading", /*imageLoading*/ ctx[4]);
			}

			if (dirty[0] & /*imageLoading, viewMode, lastChecked*/ 112 && t29_value !== (t29_value = (/*imageLoading*/ ctx[4]
			? 'Loading latest chart…'
			: /*viewMode*/ ctx[6] === 'full'
				? 'Full size · scroll to explore'
				: `Checked ${/*formatCheckedAt*/ ctx[10](/*lastChecked*/ ctx[5])}`) + "")) set_data(t29, t29_value);

			if (dirty[0] & /*viewMode*/ 64) {
				toggle_class(button2, "is-active", /*viewMode*/ ctx[6] === 'fit');
			}

			if (dirty[0] & /*viewMode*/ 64) {
				toggle_class(button3, "is-active", /*viewMode*/ ctx[6] === 'full');
			}

			if (/*chartFailed*/ ctx[3]) {
				if (if_block) ; else {
					if_block = create_if_block();
					if_block.c();
					if_block.m(div10, t35);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty[0] & /*chartSrc*/ 4 && !src_url_equal(img.src, img_src_value = /*chartSrc*/ ctx[2])) {
				attr(img, "src", img_src_value);
			}

			if (dirty[0] & /*selectedBuoy*/ 1 && img_alt_value !== (img_alt_value = `Latest DHMZ meteorological and oceanographic observations for ${/*selectedBuoy*/ ctx[0].name}`)) {
				attr(img, "alt", img_alt_value);
			}

			if (dirty[0] & /*chartFailed*/ 8) {
				toggle_class(img, "is-hidden", /*chartFailed*/ ctx[3]);
			}

			if (dirty[0] & /*viewMode*/ 64) {
				toggle_class(div10, "is-full", /*viewMode*/ ctx[6] === 'full');
			}

			if (dirty[0] & /*selectedReading*/ 2 && t37_value !== (t37_value = /*formatWaveReadingStatus*/ ctx[12](/*selectedReading*/ ctx[1]) + "")) set_data(t37, t37_value);

			if (dirty[0] & /*selectedBuoy*/ 1 && a0_href_value !== (a0_href_value = /*selectedBuoy*/ ctx[0].chartUrl)) {
				attr(a0, "href", a0_href_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div0);
				detach(t1);
				detach(section);
			}

			destroy_each(each_blocks, detaching);
			if (if_block) if_block.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	const { title } = config;
	const refreshIntervalMs = 10 * 60 * 1000;
	const checkedAtFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });

	const observedAtFormatter = new Intl.DateTimeFormat(undefined,
	{
			weekday: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});

	let selectedBuoy = buoys[0];
	let chartVersion = Date.now();
	let chartSrc = '';
	let chartFailed = false;
	let imageLoading = true;
	let lastChecked = new Date();
	let viewMode = 'full';
	let refreshTimer = null;
	let buoyMarkers = [];
	let waveReadings = {};
	let readingsGeneratedAt = null;
	let selectedReading = null;
	let hasSelectedWaveReading = false;
	const formatCoordinate = (value, positive, negative) => `${Math.abs(value).toFixed(4)}°${value >= 0 ? positive : negative}`;
	const formatCheckedAt = date => checkedAtFormatter.format(date);

	const formatWaveHeight = (reading, compact = false) => {
		if (reading?.status !== 'ok' || reading.waveHeightM === null) {
			return compact
			? '— m'
			: reading?.status === 'stale' ? 'Stale' : 'No data';
		}

		return `${reading.waveHeightM.toFixed(1)}${compact ? '' : ' '}m`;
	};

	const formatWaveReadingStatus = reading => {
		if (reading?.observedAt) {
			const observedAt = new Date(reading.observedAt);
			const label = observedAtFormatter.format(observedAt);

			return reading.status === 'ok'
			? `Wave point observed ${label}`
			: `No current wave point · last observed ${label}`;
		}

		return readingsGeneratedAt
		? `No wave data in chart checked ${formatCheckedAt(readingsGeneratedAt)}`
		: 'Wave readings refresh every 10 minutes';
	};

	const waveReadingFor = buoyId => waveReadings[buoyId];

	const makeBuoyIcon = (buoy, isSelected) => new L.DivIcon({
			className: `dhmz-buoy-marker${isSelected ? ' is-selected' : ''}`,
			html: `<span class="dhmz-buoy-marker__halo"></span>
                <span class="dhmz-buoy-marker__ring">
                    <span class="dhmz-buoy-marker__core"></span>
                </span>
                <span class="dhmz-buoy-marker__label">
                    <span class="dhmz-buoy-marker__station">${buoy.name}</span>
                    <span class="dhmz-buoy-marker__reading">
                        <span class="dhmz-buoy-marker__arrow" aria-hidden="true">▲</span>
                        <strong>${formatWaveHeight(waveReadingFor(buoy.id), true)}</strong>
                    </span>
                </span>`,
			iconAnchor: [28, 28],
			iconSize: [140, 102]
		});

	const updateMarkerSelection = () => {
		buoyMarkers.forEach(({ buoy, marker }) => {
			marker.setIcon(makeBuoyIcon(buoy, buoy.id === selectedBuoy.id));
		});
	};

	const refreshData = () => {
		$$invalidate(3, chartFailed = false);
		$$invalidate(4, imageLoading = true);
		$$invalidate(5, lastChecked = new Date());
		$$invalidate(19, chartVersion = Date.now());
	};

	const parseWaveReadings = value => {
		const payload = value;
		const normalized = {};

		if (!payload || typeof payload.generatedAt !== 'string' || !payload.buoys) {
			throw new Error('Invalid wave readings payload');
		}

		buoys.forEach(buoy => {
			const reading = payload.buoys?.[buoy.id];
			const height = reading?.waveHeightM;
			const observedAt = reading?.observedAt;
			const isValidHeight = typeof height === 'number' && Number.isFinite(height) && height >= 0 && height <= 25;
			const isValidObservedAt = typeof observedAt === 'string' && !Number.isNaN(new Date(observedAt).getTime());

			normalized[buoy.id] = reading?.status === 'ok' && isValidHeight && isValidObservedAt
			? {
					waveHeightM: height,
					status: 'ok',
					observedAt
				}
			: {
					waveHeightM: null,
					status: reading?.status === 'no-data' || reading?.status === 'stale'
					? reading.status
					: 'error',
					observedAt: isValidObservedAt ? observedAt : null
				};
		});

		return {
			generatedAt: payload.generatedAt,
			buoys: normalized
		};
	};

	const refreshWaveReadings = async () => {
		try {
			const response = await fetch(`${waveReadingsUrl}?windy-refresh=${Date.now()}`, { cache: 'no-store' });

			if (!response.ok) {
				throw new Error(`Wave readings request failed with ${response.status}`);
			}

			const payload = parseWaveReadings(await response.json());
			const generatedAt = new Date(payload.generatedAt);
			$$invalidate(20, waveReadings = payload.buoys);
			readingsGeneratedAt = Number.isNaN(generatedAt.getTime()) ? null : generatedAt;
			updateMarkerSelection();
		} catch(error) {
			console.warn('DHMZ wave readings are temporarily unavailable', error);
		}
	};

	const refreshAllData = () => {
		refreshData();
		void refreshWaveReadings();
	};

	const selectBuoy = (buoy, focusMap = true) => {
		$$invalidate(0, selectedBuoy = buoy);
		$$invalidate(6, viewMode = 'full');
		updateMarkerSelection();
		refreshData();

		if (focusMap) {
			map.setView({ lat: buoy.lat, lng: buoy.lon }, Math.max(map.getZoom(), 7));
		}
	};

	const showAllBuoys = () => {
		map.setView(
			{
				lat: networkCenter.lat,
				lng: networkCenter.lon
			},
			6
		);
	};

	const addBuoyMarkers = () => {
		if (buoyMarkers.length > 0) {
			return;
		}

		buoyMarkers = buoys.map(buoy => {
			const marker = new L.Marker({ lat: buoy.lat, lng: buoy.lon },
			{
					icon: makeBuoyIcon(buoy, buoy.id === selectedBuoy.id),
					title: `${buoy.name} DHMZ buoy`
				}).addTo(map);

			marker.on('click', () => selectBuoy(buoy, false));
			return { buoy, marker };
		});
	};

	const removeBuoyMarkers = () => {
		buoyMarkers.forEach(({ marker }) => marker.remove());
		buoyMarkers = [];
	};

	const handleChartLoaded = () => {
		$$invalidate(4, imageLoading = false);
		$$invalidate(3, chartFailed = false);
	};

	const handleChartError = () => {
		$$invalidate(4, imageLoading = false);
		$$invalidate(3, chartFailed = true);
	};

	const onopen = () => {
		addBuoyMarkers();
		showAllBuoys();
		refreshAllData();
	};

	onMount(() => {
		void refreshWaveReadings();
		refreshTimer = setInterval(refreshAllData, refreshIntervalMs);
	});

	onDestroy(() => {
		removeBuoyMarkers();

		if (refreshTimer) {
			clearInterval(refreshTimer);
			refreshTimer = null;
		}
	});

	const click_handler = () => bcast.emit('rqstOpen', 'menu');
	const click_handler_1 = buoy => selectBuoy(buoy);
	const click_handler_2 = () => $$invalidate(6, viewMode = 'fit');
	const click_handler_3 = () => $$invalidate(6, viewMode = 'full');

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*selectedBuoy, chartVersion*/ 524289) {
			$$invalidate(2, chartSrc = `${selectedBuoy.chartUrl}?windy-refresh=${chartVersion}`);
		}

		if ($$self.$$.dirty[0] & /*waveReadings, selectedBuoy*/ 1048577) {
			$$invalidate(1, selectedReading = waveReadings[selectedBuoy.id] ?? null);
		}

		if ($$self.$$.dirty[0] & /*selectedReading*/ 2) {
			$$invalidate(7, hasSelectedWaveReading = selectedReading?.status === 'ok' && selectedReading.waveHeightM !== null);
		}
	};

	return [
		selectedBuoy,
		selectedReading,
		chartSrc,
		chartFailed,
		imageLoading,
		lastChecked,
		viewMode,
		hasSelectedWaveReading,
		title,
		formatCoordinate,
		formatCheckedAt,
		formatWaveHeight,
		formatWaveReadingStatus,
		refreshAllData,
		selectBuoy,
		showAllBuoys,
		handleChartLoaded,
		handleChartError,
		onopen,
		chartVersion,
		waveReadings,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3
	];
}

class Plugin extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { onopen: 18 }, add_css, [-1, -1]);
	}

	get onopen() {
		return this.$$.ctx[18];
	}
}


// transformCode: Export statement was modified
export { __pluginConfig, Plugin as default };
//# sourceMappingURL=plugin.js.map
