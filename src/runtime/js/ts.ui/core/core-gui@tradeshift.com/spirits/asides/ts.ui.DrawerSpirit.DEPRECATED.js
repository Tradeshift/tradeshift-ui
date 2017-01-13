/**
 * Spirit of the backwards compatible SideBar.
 * @extends {ts.ui.SideBarSpirit}
 * @deprecated
 */
ts.ui.DrawerSpirit = ts.ui.SideBarSpirit.extend({

  /**
   * Start with a warning. Then escalate to sending e-mails to the developer.
   */
	onconfigure: function() {
		this.super.onconfigure();
		console.warn(
      'IMPORTANT: The "ts-drawer" is deprecated. Long live the "ts-sidebar".'
    );
	}

});
