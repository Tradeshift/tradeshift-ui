# Navigation Items

### Global Menu Items

![Global menu items with branding](assets/img/navigation-global-tablet-branded1.png)

Menu items can be inserted anywhere in the global menu to provide direct access to your application. An application icon must be provided as well as a name for your application. A highlight color can be specified for your menu item, allowing integration of your visual identity in combination with your custom icon.

### Shortcuts

![Shortcuts on a tablet](assets/img/navigation-global-tablet-shortcuts.png)

Shortcuts are only available in tablet size and are stacked vertically along the left side of the screen under the Tradeshift logo mark. The shortcuts are basically global menu items that have been defined to also appear in the shortcut list. This means that the shortcuts are a subset of the  global menu items. Only specify your global menu item as a shortcut if frequent and repeated access to your functionality on mobile devices is necessary.

### Contextual menu

The contextual menu ([the area above the main content area](http://tradeshift.github.io/#design/guidelines/structure.html)) can be customized in a few different ways.

#### Contextual actions

![Contextual actions](assets/img/navigation-contextual-actions.png)

When using the contextual bar to present actions, these actions must always be highest level actions to what’s on the page. I.e. actions that manipulate the entirety of the contents.

![Invoice creation example](assets/img/button-styles-01.png)

The invoice creation example has document delete, save and send as contextual actions. These actions modify the entirety of what’s on the page. More fine-grained controls, such as adding lines, belong to the contents of the document, and should never appear in the contextual bar as actions. An alternative example [connector app and connections page] is when the page contains a collection of objects. In this case, the contextual action of adding another object to the collection is allowed as contextual action, as it alters the collection, being the highest level on that kind of page.

#### Tabbed navigation

![Tabbed navigation](assets/img/navigation-contextual-tabbed1.png)

The contextual bar can also contain tabs with the purpose of splitting related contents into subsections that can be processed individually in any given order. An example is this documentation.

#### Progress-tabbed navigation

![Progress tabbed navigation in action](assets/img/navigation-contextual-tabbed-progress.png)

When a tabbed navigation is preferred but there’s a requirement for users to process all tabs in order, the progress-tabbed contextual bar is used. Note that the progress-tabbed navigation leaves ample space for a flow headline, by keeping the progress tabs below the contextual bar space. Progress-tabbed navigation works well for setup flows where all steps are required, such as a custom registration flow.

![Progress tabbed navigation in a custom registration flow](assets/img/navigation-tabs-progressive1.gif)

#### Filtering and searching


![Searching in the TopBar](assets/img/navigation-contextual-search1.png)

For managing complex lists the contextual bar can be completely exchanged with search and filter functionality. This is especially usable for long lists, such as the documents list pages.

![Searching in the Document List](assets/img/navigation-context-search.gif)


#### Hidden

When the contextual bar doesn’t do anything it can be completely removed. Note that in phone size UI there’s always a bar containing the current page’s title.

#### Combinations

It’s not recommended to combine the above mentioned contextual bar types. For instance having both tabs and contextual actions simultaneously may work in some situations on desktop. But language variants (longer labels/titles) and fluidity across devices carry the risk of rendering your combined interface unusable for larger segments of users.

### Pickers as navigation hubs
[Pickers](http://tradeshift.github.io/#design/patterns/pickers.html) also provide the opportunity to function as navigation items.


> ###### For Developers
> Read more about [Components related to Navigation](//tradeshift.github.io/#components/overview/layout.html).

------------------------------------------------------------------------
Continue reading our Design Patterns on the [Basic Inputs](//tradeshift.github.io/#design/patterns/inputs.html) page.
