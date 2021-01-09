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

    //TODO: Remove this, just testing we have our own layout in the menu.
    // this.pages.style.backgroundColor = '#FFAABB';
    // this.pages.style.height = '100%';
    // this.pages.style.display = 'block';
  },

  stop() {
    const pages = this.pages;
    pages && (pages.style.display = 'none');
  }
};
