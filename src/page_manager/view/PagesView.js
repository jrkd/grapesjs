import Backbone from 'backbone';
import { isString, isObject, bindAll } from 'underscore';
import PageView from './PageView';
import CategoryView from './CategoryView';

export default Backbone.View.extend({
  events: {
    click: 'onClick',
    deleteClick: 'handleDeleteClick'
  },
  initialize(opts, config) {
    bindAll(this, 'getSorter', 'onDrag', 'onDrop');
    this.config = config || {};
    this.categories = opts.categories || '';
    this.renderedCategories = [];
    var ppfx = this.config.pStylePrefix || '';
    this.ppfx = ppfx;
    this.noCatClass = `${ppfx}pages-no-cat`;
    this.blockContClass = `${ppfx}pages-c`;
    this.catsClass = `${ppfx}page-categories`;
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
    this.em = this.config.em;
    this.tac = 'test-tac';
    this.grabbingCls = this.ppfx + 'grabbing';

    if (this.em) {
      this.config.getSorter = this.getSorter;
      this.canvas = this.em.get('Canvas');
    }

    //("#new-page-btn").on('click', onClick);
  },

  onClick(event) {
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    console.log('on clicktest');
    if (event.target.closest('.gjs-add-page-btn') != null) {
      editor.PageManager.add('testpage' + getRandomInt(10, 10000), {
        label: 'test page from even11t',
        attributes: { class: 'gjs-page-item' },
        content: ``
      });
    }
    if (event.target.closest('.fa.fa-trash') != null) {
      editor.PageManager.remove(event.target.closest('.gjs-page-item').id);
    }
  },

  updateConfig(opts = {}) {
    this.config = {
      ...this.config,
      ...opts
    };
  },

  /**
   * Get sorter
   * @private
   */
  getSorter() {
    if (!this.em) return;
    if (!this.sorter) {
      var utils = this.em.get('Utils');
      var canvas = this.canvas;
      this.sorter = new utils.Sorter({
        container: canvas.getBody(),
        placer: canvas.getPlacerEl(),
        containerSel: '*',
        itemSel: '*',
        pfx: this.ppfx,
        onStart: this.onDrag,
        onEndMove: this.onDrop,
        onMove: this.onMove,
        document: canvas.getFrameEl().contentDocument,
        direction: 'a',
        wmargin: 1,
        nested: 1,
        em: this.em,
        canvasRelative: 1
      });
    }
    return this.sorter;
  },

  /**
   * Callback when block is on drag
   * @private
   */
  onDrag(e) {
    this.em.stopDefault();
    this.em.trigger('block:drag:start', e);
  },

  onMove(e) {
    this.em.trigger('block:drag:move', e);
  },

  /**
   * Callback when block is dropped
   * @private
   */
  onDrop(model) {
    const em = this.em;
    em.runDefault();

    if (model && model.get) {
      if (model.get('activeOnRender')) {
        model.trigger('active');
        model.set('activeOnRender', 0);
      }

      em.trigger('block:drag:stop', model);
    }
  },

  /**
   * Add new model to the collection
   * @param {Model} model
   * @private
   * */
  addTo(model) {
    this.add(model);
  },

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model, fragment) {
    const { config } = this;
    var frag = fragment || null;
    var view = new PageView(
      {
        model,
        attributes: model.get('attributes')
      },
      config
    );
    var rendered = view.render().el;
    var category = model.get('category');

    // Check for categories
    if (category && this.categories && !config.ignoreCategories) {
      if (isString(category)) {
        category = {
          id: category,
          label: category
        };
      } else if (isObject(category) && !category.id) {
        category.id = category.label;
      }

      var catModel = this.categories.add(category);
      var catId = catModel.get('id');
      var catView = this.renderedCategories[catId];
      var categories = this.getCategoriesEl();
      model.set('category', catModel);

      if (!catView && categories) {
        catView = new CategoryView(
          {
            model: catModel
          },
          this.config
        ).render();
        this.renderedCategories[catId] = catView;
        categories.appendChild(catView.el);
      }

      catView && catView.append(rendered);
      return;
    }

    if (frag) frag.appendChild(rendered);
    else this.append(rendered);
  },

  getCategoriesEl() {
    if (!this.catsEl) {
      this.catsEl = this.el.querySelector(`.${this.catsClass}`);
    }

    return this.catsEl;
  },

  getPagesEl() {
    if (!this.blocksEl) {
      this.blocksEl = this.el.querySelector(
        `.${this.noCatClass} .${this.blockContClass}`
      );
    }

    return this.blocksEl;
  },

  append(el) {
    let blocks = this.getPagesEl();
    blocks && blocks.appendChild(el);
  },

  render() {
    console.log('render');
    const ppfx = this.ppfx;
    const frag = document.createDocumentFragment();
    this.catsEl = null;
    this.blocksEl = null;
    this.renderedCategories = [];
    this.el.innerHTML = `
      <div class="${this.noCatClass}">
      <div class="gjs-add-page-btn gjs-four-color-h"><span title="Add Page" id="new-page-btn" class="gjs-add-page-btn-icon fa fa-plus"></span>Add Page...</div>
        <div class="${this.blockContClass}"></div>
      </div>
    `;

    this.collection.each(model => this.add(model, frag));
    this.append(frag);
    const cls = `${this.blockContClass}s ${ppfx}one-bg ${ppfx}two-color`;
    this.$el.addClass(cls);
    return this;
  }
});
