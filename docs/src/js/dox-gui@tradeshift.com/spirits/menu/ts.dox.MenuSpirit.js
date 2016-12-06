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
      path = folder(path);
      var then = new gui.Then();
      var that = this;
      var open = null;
      function folder(full) {
        return full.replace(/[^\/]*$/, '');
      }
      (function loop(items, container) {
        items.filter(function(item) {
          return !item.hidden;
        }).forEach(function(item) {
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
                  that._onsubmenu(item, then);
                  open = item;
                }
              } else {
                that._onnormal(item, then);
              }
            }
          }
          if(item.items) {
            loop(item.items, item);
          }
        });
      }(this._model.items));
      this._open = open || this._open;
      return this._then || then.now();
    },
    
    /**
     * Handle tween.
     * @see {ts.dox.SubMenuSpirit}
     * @param {gui.Tween} t
     */
    ontween: function(t) {
      this.super.ontween(t);
      if(t.type === 'doxmenu' && t.done) {
        if(this._next) {
          this._next.open = true;
          this._next = null;
        } else {
          this.tween.remove(t.type);
          if(this._then) {
            this._then.now();
            this._then = null;
          }
        }
      }
    },
    
    
    // Private .................................................................
    
    /**
     * @type {ts.dox.MenuModel}
     */
    _model: null,
    
    /**
     * @type {gui.Then}
     */
    _then: null,
    
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
     * Item with subitems selected.
     * @param {ts.dox.ItemModel} item
     * @param {gui.Then} then
     */
    _onsubmenu: function(item, then) {
      if(ts.dox.booting) {
        item.open = true;
        then.now();
      } else {
        this.tween.add('doxmenu');
        this._then = then;
        if(this._open) {
          this._next = item;
          this._open.open = false;
        } else {
          item.open = true;
        }
      }
    },
    
    /**
     * Regular item selected.
     * @param {ts.dox.ItemModel} item
     * @param {gui.Then} then
     */
    _onnormal: function(item, then) {
      if(!ts.dox.booting && this._open) {
        this.tween.add('doxmenu');
        this._open.open = false;
        this._then = then;
        this._open = null;
      } else {
        then.now();
      }
    },

    /**
     * @param {Array<Object>} results
     */
    showresults: function(results) {
    	this._model.searchresults = results || null;
	    this.script.run(); // TODO: shoul not be needed :(
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
