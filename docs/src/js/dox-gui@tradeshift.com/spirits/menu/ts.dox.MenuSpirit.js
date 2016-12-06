/**
 * Spirit of the Dox menu.
 * @using {function} isInView
 * @using {function} goIntoView
 */
ts.dox.MenuSpirit = (function using(isInView, goIntoView) {
  
  return ts.ui.Spirit.extend({
  
    /**
     * Setup much.
     */
    onconfigure: function() {
      this.super.onconfigure();
      this.css.add('ts-menu');
      this._loadmenu(this.dom.q('script'));
    },
    
    /**
     * Make sure the selected item is visible.
		 * @param {TODOType} summary
		 */
		onrender: function(summary) {
			this.super.onrender(summary);
      if(this._newselection) {
        this._revealchecked(this.dom.q('.ts-checked'));
        this._newselection = false;
      }
		},
    
    /**
     * Select appropriate item by folder path (ignoring any file name).
     * This gets called by the {ts.dox.DoxChromeSpirit} on hashchange.
     * @param {string} path
     * @returns {gui.Then}
     */
    selectbestitem: function(path) {
      if(this._model.searchresults) {
      	this._selectsearchitem(path);
      } else {
      	this._selectnormalitem(path);
      }
      return new gui.Then().now();
    },
    
    
    // Private .................................................................
    
    /**
     * @type {ts.dox.MenuModel}
     */
    _model: null,

    /**
     * Render menu from embedded JSON.
     * @param {HTMLScriptElement} script
     */
    _loadmenu: function(script) {
      this._model = new ts.dox.MenuModel({
        items: JSON.parse(script.textContent.trim())
      });
      this.script.load(ts.dox.MenuSpirit.edbml);
      this.script.input(this._model);
    },
    
    /**
     * Make sure the selected item can be seen.
     * @param {HTMLLiElement} checked
     */
    _revealchecked: function(checked) {
      if(checked && !isInView(checked)) {
        goIntoView(checked);
      }
    },

    /**
     * @param {string} path
     */
    _selectnormalitem: function(path) {
    	path = folder(path);
    	var that = this;
      var open = null;
      function folder(full) {
        return full.replace(/[^\/]*$/, '');
      }
      function visible(item) {
        return !item.hidden;
      }
      (function closeall(items) { // reset previous run
      	items.filter(visible).forEach(function(item) {
      		item.open = false;
      		if(item.items) {
      			closeall(item.items);
      		}
        });
      }(this._model.items));
      (function loop(items, container) { // current run
        items.filter(visible).forEach(function(item) {
          if(item.path) {
            var match = folder(item.path) === path;
            var state = item.selected;
            if((item.selected = match)) {
              if(match !== state) {
                that._newselection = true;
              }
              if(container) {
                container.open = true;
                open = container;
              } else if(item.items) {
                if(!item.open) {
					        item.open = true;
                }
              }
            }
          }
          if(item.items) {
            loop(item.items, item);
          }
        });
      }(this._model.items));
    },

    /**
     * @param {string} path
     */
    _selectsearchitem: function(path) {
    	this._model.searchresults.forEach(function(result) {
    		result.selected = result.href === path;
    	});
    },

    /**
     * @param {Array<Object>} results
     */
    showresults: function(results) {
    	this._model.searchresults = results || null;
    	this.dom.parent().scrollTop = 0;
	    this.script.run(); // TODO: shoul not be needed :(
	    if(!results) {
	    	ts.ui.Notification.info('TODO: scrollIntoView!');
	    }
    }
    
  });

}(
  
  /**
   * Element is visible?
   * @param {Element} el
   * @returns {boolean}
   */
  function isInView(el) {
    var rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  },
  
  /**
   * NOTE: Firefox supports this animated, see http://mdn.io/scrollIntoView, 
   * however this kind of animation should not happen on initial page load.
   * @param {Element} el
   */
  function intoView(el) {
    el.scrollIntoView(false);
  }
));
