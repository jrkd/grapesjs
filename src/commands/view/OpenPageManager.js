export default {
  run(editor, sender) {
    const bm = editor.PageManager;
    const pn = editor.Panels;
    console.log('openpagemanager run');
    //if (!this.pages) {
    bm.render();
    const id = 'views-container';
    const pages = document.createElement('div');

    const panels = pn.getPanel(id) || pn.addPanel({ id });
    pages.appendChild(bm.getContainer());
    panels.set('appendContent', pages).trigger('change:appendContent');
    this.pages = pages;
    //}
  },

  stop() {
    const pages = this.pages;
    pages && (pages.style.display = 'none');
  }
};
