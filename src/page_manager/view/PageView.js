import Backbone from 'backbone';

export default Backbone.View.extend({
  events: {
    click: 'handleClick'
  },

  initialize(o, config = {}) {
    const { model } = this;
    this.em = config.em;
    this.config = config;
    console.log('do i have a storage manager?', this.config);
    this.storageManager = this.em.config.storageManager;
    this.ppfx = config.pStylePrefix || '';
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change', this.render);

    this.previousPageComponents = [];

    this.em.currentPage = this;
  },

  handleClick() {
    const { em, model } = this;
    console.log('click page', model);
    let currentPageComponents = em.getHtml();

    this.em.currentPage.model.content = em.getHtml();
    this.em.currentPage = this;

    em.setComponents(this.em.currentPage.model.content);
    //this.previousPageComponents = currentPageComponents;
    em.refreshCanvas();
  },

  render() {
    const { em, el, $el, ppfx, model } = this;
    console.log($el);
    const disable = model.get('disable');
    const attr = model.get('attributes') || {};
    const cls = attr.class || '';
    const className = `${ppfx}page`;
    const label = 'Test Page';
    //(em && em.t(`blockManager.labels.${model.id}`)) || model.get('label');
    const render = model.get('render');
    const media = model.get('media');
    const clsAdd = disable ? `${className}--disable` : `${ppfx}four-color-h`;
    $el.attr(attr);
    el.className = `${cls} ${className} ${ppfx}one-bg ${clsAdd}`.trim();
    el.innerHTML = `
      ${media ? `<div class="${className}__media--TEST">${media}</div>` : ''}
      <div class="${className}-label">${label}</div>
    `;
    el.title = 'TEST PAGE TITLE'; //el.textContent.trim();
    const result = render && render({ el, model, className, prefix: ppfx });
    if (result) el.innerHTML = result;
    return this;
  }
});
