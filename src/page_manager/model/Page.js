import Backbone from 'backbone';
import Category from './Category';

export default Backbone.Model.extend({
  defaults: {
    content: '',
    css: '',
    isCurrentPage: false
  },

  initialize(opts = {}) {}
});
