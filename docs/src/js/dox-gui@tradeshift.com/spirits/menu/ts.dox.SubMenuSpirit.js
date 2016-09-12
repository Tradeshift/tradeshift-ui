/**
 * Spirit of the submenu item.
 * @using {ts.dox.ItemSpirit} ItemSpirit
 * @using {gui.Client} Client
 */
ts.dox.SubMenuSpirit = (function using(ItemSpirit, Client) {
  
  return ItemSpirit.extend({
    
    /**
     * Open or close the submenu (via markup attribute `data-ts.open`)
     * @param {boolean} open
     */
    open: function(open) {
      if(open !== this._open) {
        this._open = open;
        if(Client.hasTransitions && !ts.dox.booting) {
          this._sliding = true;
          this.css.add('sliding');
          this.tween.add('doxmenu');
          this._tweenstart(this.dom.q('menu'), open);
        } else {
          this.css.shift(open, 'open');
        }
      }
    },
    
    /**
     * @param {gui.Tween} t
     */
    ontween: function(t) {
      this.super.ontween(t);
      if(this._sliding && t.type === 'doxmenu') {
        if(t.init) {
          if(!this._open) {
            this.css.remove('open');
          }
        } else if(t.done) {
          this._sliding = false;
          this.tween.remove('doxmenu');
          this.css.remove('sliding');
          if(this._open) {
            this.css.add('open');
          }
        }
      }
    },
    
    
    // Private .................................................................
    
    /**
     * Is open?
     * @type {boolean}
     */
    _open: false,
    
    /**
     * Is sliding?
     * @type {}
     */
    _sliding: false,
    
    /**
     * @param {HTMLMenuElement} menu
     * @param {boolean} open
     */
    _tweenstart: function(menu, open) {
      var delta = menu.offsetHeight * (open ? 1 : -1);
      this.dom.following(ItemSpirit).forEach(function(item) {
        item.delta(delta);
      });
      this.tween.dispatch('doxmenu', {
        duration: ts.ui.TRANSITION_NOW,
        timing: 'ease-out'
      });
    }
    
  });
  
}(ts.dox.ItemSpirit, gui.Client));
