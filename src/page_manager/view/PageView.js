import Backbone from 'backbone';

export default Backbone.View.extend({
  events: {
    click: 'handleClick'
  },

  initialize(o, config = {}) {
    const { model } = this;
    this.em = config.em;
    this.config = config;
    this.storageManager = this.em.config.storageManager;
    this.ppfx = config.pStylePrefix || '';
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change', this.render);
  },

  handleClick() {
    const { em, el, $el, ppfx, model } = this;
    console.log('click page', model);

    // Here we really only want to trigger an event to the pages view? (select-page - <id>)

    //PageManager:
    // onSelectPage pages.currentPage = pages.get(<id>)

    //The contents changing stuff actually should happen any time theres a change to the canvas model.

    const pageManager = this.em.attributes.PageManager;
    pageManager.ChangePage(this.model, em);
    //   let currentPageModel = pageManager.getCurrentPage();
    //   if(currentPageModel){
    //     currentPageModel.set('content' , em.getHtml());
    //     let pageCSS = '';
    //     em.getStyle().each(function(rule, index) {
    //       pageCSS += ' ' + rule.toCSS();
    //     });
    //     this.em.currentPage.set('css',  pageCSS);

    //     this.em.currentPage.set('isCurrentPage', false);

    //   }
    //   this.model.set('isCurrentPage', true);
    //   this.em.currentPage = this;

    //   em.setComponents(this.model.get('content'));
    //   em.setStyle(this.model.get('css'));
    //   em.refreshCanvas();
    //   $el.closest(".gjs-pages-c").find(".gjs-page--current").removeClass("gjs-page--current");
    //   this.render();
  },

  handleDeleteClick() {
    const { em, model } = this;
    console.log('click delete page', model);
    let currentPageComponents = em.getHtml();

    this.em.currentPage.model.content = em.getHtml();
    let pageCSS = '';
    em.getStyle().each(function(rule, index) {
      pageCSS += ' ' + rule.toCSS();
    });
    this.em.currentPage.model.css = pageCSS;

    this.em.currentPage = this;

    em.setComponents(this.em.currentPage.model.content);
    em.setStyle(this.em.currentPage.model.css);
    //this.previousPageComponents = currentPageComponents;
    em.refreshCanvas();
  },

  render() {
    const { em, el, $el, ppfx, model } = this;
    console.log($el);
    const disable = model.get('disable');
    const attr = model.get('attributes') || {};
    const cls = attr.class || '';
    let className = `${ppfx}page`;

    const label = model.get('id');
    //(em && em.t(`blockManager.labels.${model.id}`)) || model.get('label');
    const render = model.get('render');
    const media = model.get('media');
    const clsAdd = disable ? `${className}--disable` : `${ppfx}four-color-h`;
    $el.attr(attr);
    el.className = `${cls} ${className} ${
      model.get('isCurrentPage') ? className + '--current' : ''
    } ${ppfx}one-bg ${clsAdd}`.trim();
    el.innerHTML = `
      ${media ? `<div class="${className}__media--TEST">${media}</div>` : ''}
      <div class="${className}-label">${label}</div><span title="Delete Page" class="gjs-pn-btn fa fa-trash"></span>
    `;
    el.title = 'TEST PAGE TITLE'; //el.textContent.trim();
    el.id = model.get('id');
    const result = render && render({ el, model, className, prefix: ppfx });
    if (result) el.innerHTML = result;
    return this;
  }
});
