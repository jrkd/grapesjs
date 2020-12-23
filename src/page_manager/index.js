/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/block_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  blockManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const blockManager = editor.BlockManager;
 * ```
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getAllVisible](#getallvisible)
 * * [remove](#remove)
 * * [getConfig](#getconfig)
 * * [getCategories](#getcategories)
 * * [getContainer](#getcontainer)
 * * [render](#render)
 *
 * @module BlockManager
 */
import { isElement } from 'underscore';
import defaults from './config/config';
import Pages from './model/Pages';
import PageCategories from './model/Categories';
import PagesView from './view/PagesView';

export default () => {
  var c = {};
  var pages, pagesVisible, pagesView;
  var categories = [];

  return {
    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'PageManager',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @return {this}
     * @private
     */
    init(config) {
      c = config || {};
      const em = c.em;

      for (let name in defaults) {
        if (!(name in c)) {
          c[name] = defaults[name];
        }
      }

      // Global pages collection
      pages = new Pages([]);
      pagesVisible = new Pages([]);
      categories = new PageCategories();

      // Setup the sync between the global and public collections
      pages.listenTo(pages, 'add', model => {
        pagesVisible.add(model);
        em && em.trigger('pagemanager:add', model);
      });

      pages.listenTo(pages, 'remove', model => {
        pagesVisible.remove(model);
        em && em.trigger('pagemanager:remove', model);
      });

      return this;
    },

    /**
     * Get configuration object
     * @return {Object}
     */
    getConfig() {
      return c;
    },

    /**
     * Load default pages if the collection is empty
     */
    onLoad() {
      const pages = this.getAll();
      !pages.length && pages.reset(c.blocks);
    },

    /**
     * Executed once the main editor instance is rendered
     * @private
     */
    postRender() {
      const collection = pagesVisible;
      pagesView = new PagesView({ collection, categories }, c);
      const elTo = this.getConfig().appendTo;

      if (elTo) {
        const el = isElement(elTo) ? elTo : document.querySelector(elTo);
        el.appendChild(this.render(pagesVisible.models));
      }
    },

    /**
     * Add new block to the collection.
     * @param {string} id Block id
     * @param {Object} opts Options
     * @param {string} opts.label Name of the block
     * @param {string} opts.content HTML content
     * @param {string|Object} opts.category Group the block inside a catgegory.
     *                                      You should pass objects with id property, eg:
     *                                      {id: 'some-uid', label: 'My category'}
     *                                      The string will be converted in:
     *                                      'someid' => {id: 'someid', label: 'someid'}
     * @param {Object} [opts.attributes={}] Block attributes
     * @return {Block} Added block
     * @example
     * blockManager.add('h1-block', {
     *   label: 'Heading',
     *   content: '<h1>Put your title here</h1>',
     *   category: 'Basic',
     *   attributes: {
     *     title: 'Insert h1 block'
     *   }
     * });
     */
    add(id, opts) {
      var obj = opts || {};
      obj.id = id;
      return pages.add(obj);
    },

    /**
     * Return the block by id
     * @param  {string} id Block id
     * @example
     * const block = blockManager.get('h1-block');
     * console.log(JSON.stringify(block));
     * // {label: 'Heading', content: '<h1>Put your ...', ...}
     */
    get(id) {
      return pages.get(id);
    },

    /**
     * Return all blocks
     * @return {Collection}
     * @example
     * const blocks = blockManager.getAll();
     * console.log(JSON.stringify(blocks));
     * // [{label: 'Heading', content: '<h1>Put your ...'}, ...]
     */
    getAll() {
      return pages;
    },

    /**
     * Return the visible collection, which containes blocks actually rendered
     * @return {Collection}
     */
    getAllVisible() {
      return pagesVisible;
    },

    /**
     * Remove a block by id
     * @param {string} id Block id
     * @return {Block} Removed block
     * @example
     * // Id of the block which need to be removed
     * const id = 'button';
     * blockManager.remove(id);
     */
    remove(id) {
      return pages.remove(id);
    },

    /**
     * Get all available categories.
     * It's possible to add categories only within blocks via 'add()' method
     * @return {Array|Collection}
     */
    getCategories() {
      return categories;
    },

    /**
     * Return the Blocks container element
     * @return {HTMLElement}
     */
    getContainer() {
      return pagesView.el;
    },

    /**
     * Render blocks
     * @param  {Array} pages Blocks to render, without the argument will render all global blocks
     * @param  {Object} [opts={}] Options
     * @param  {Boolean} [opts.external] Render blocks in a new container (HTMLElement will be returned)
     * @param  {Boolean} [opts.ignoreCategories] Render blocks without categories
     * @return {HTMLElement} Rendered element
     * @example
     * // Render all blocks (inside the global collection)
     * blockManager.render();
     *
     * // Render new set of blocks
     * const blocks = blockManager.getAll();
     * const filtered = blocks.filter(block => block.get('category') == 'sections')
     *
     * blockManager.render(filtered);
     * // Or a new set from an array
     * blockManager.render([
     *  {label: 'Label text', content: '<div>Content</div>'}
     * ]);
     *
     * // Back to blocks from the global collection
     * blockManager.render();
     *
     * // You can also render your blocks outside of the main block container
     * const newBlocksEl = blockManager.render(filtered, { external: true });
     * document.getElementById('some-id').appendChild(newBlocksEl);
     */
    render(pages, opts = {}) {
      const toRender = pages || this.getAll().models;

      if (opts.external) {
        const collection = new Pages(toRender);
        return new PagesView(
          { collection, categories },
          { ...c, ...opts }
        ).render().el;
      }

      if (pagesView) {
        pagesView.updateConfig(opts);
        pagesView.collection.reset(toRender);

        if (!pagesView.rendered) {
          pagesView.render();
          pagesView.rendered = 1;
        }
      }

      return this.getContainer();
    },

    destroy() {
      pages.reset();
      pages.stopListening();
      pagesVisible.reset();
      categories.reset();
      pagesView && pagesView.remove();
      [pages, pagesVisible, categories, pagesView].forEach(i => (i = null));
      c = {};
    }
  };
};
