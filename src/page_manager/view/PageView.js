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
  },

  handleClick() {
    console.log('click page');
    let currentPageComponents = this.em.getComponents();

    this.em.setComponents(this.previousPageComponents);
    //this.em.config.components = this.previousPageComponents;
    //this.em.setStyle(this.previousPageStyle);

    this.previousPageComponents = currentPageComponents;
    //this.previousPageStyle = currentPageStyle;
    this.em.refreshCanvas();
  },

  render() {
    const { em, el, $el, ppfx, model } = this;
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
