# UI Structure

Tradeshift is a platform which provides an extensible UI.

App vendors can build applications that integrate into and extend the existing UI. Understanding the structure of the Tradeshift platform UI will allow you to design great app interfaces that fit seamlessly into the existing user experience.

### Navigation

Due to the responsive nature of Tradeshift, you should pay careful attention to how UI elements transform across screen sizes. The application’s navigation elements transform as illustrated in the following:

**Small “phone size” devices (<600px):** The *main content area* takes up as much space as possible, leaving only shortcuts for the *global menu* and the *contextual menu*. All *contextual menu items* are to be found in the *contextual menu picker*.

![Tradeshift on a phone](assets/img/deviceanimation-phone-2.gif)

**Medium “tablet size” devices (600px to 1270px):** The *primary* and *secondary contextual actions* are visible in the *contextual menu* rendered across the top of the screen. *Tertiary contextual actions* – which are expected to be used less often – are hidden in a *contextual menu picker*.

![Tradeshift on a tablet](assets/img/deviceanimation-tablet-3.gif)

**Large “desktop size” devices (>1270px):** The *global menu* is expanded and the *contextual menu* behaves as in “tablet” style.

![Tradeshift on a desktop](assets/img/deviceanimation-desktop-2.gif)

### Purpose of elements

#### Global menu

The *global menu* is the primary way for the user to switch between the main functional areas. Core applications such as *document creation* and *user settings* provide a *[global menu item](http://tradeshift.github.io/docs/#design/patterns/nav.html)* for the user to access these applications directly. The *global menu* is present in all contexts and cannot be disabled. It will, however, expand and collapse based on available screen space.

#### Contextual menu

The *contextual menu* serves multiple purposes and takes on different appearances. In the examples above, the *contextual menu* contains actions, but other uses of the *contextual menu* – such as tabbed navigation – are possible. [See all different variations.](http://tradeshift.github.io/docs/#design/patterns/nav.html)

#### Main content area

Here’s where most task solving takes place. Tradeshift applications are designed on a fluid grid, which lets applications “fluidly” fill out the entire main content area on all screen resolutions, up to 1270 point width. Attempts should always be made, to fill out the main content area – and if this is not possible, you should visually define the boundaries of the functionality.


> ###### For Developers
> Read more about [Components related to Layout](//tradeshift.github.io/docs/#components/overview/layout.html).


------------------------------------------------------------------------
Continue reading our Design Guidelines on the [Keyboard & Gestures](//tradeshift.github.io/docs/#design/guidelines/gestures.html) page.
