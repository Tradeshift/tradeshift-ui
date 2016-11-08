# Buttons

A collection of button styles exist to visually prioritize the possible actions in your application. Styles include the color, size and position of the buttons. Applying these button styles correctly will [help the user focus](http://tradeshift.github.io/#design/guidelines/principles.html) on the most likely next action.

By prioritizing the user flows in your application you will know which flows are most likely to be used by the majority of users. One way of making these most likely paths clear to the users is by applying the appropriate button styles. 

Four main button styles exist:

1. **Primary button:** The most likely action the user will take. On desktop and tablet size interface, this button is almost always positioned in the top right corner of the window or it’s attached at the end of the content in the main content area.
2. **Secondary button(s):** Functionality that many users will need but without which the application pages would still work. The secondary button(s) are located to the left of the primary button on desktop and tablet size interface.
3. **Tertiary button(s):** Functionality that isn’t often used by the majority of users should be styled and positioned as tertiary buttons. Example: exporting or deleting a viewed document.
4. **Kill button:** Functionality that performs a deletion or rejection action. These buttons are visually styled to alert the user and are most often placed in [pickers](http://tradeshift.github.io/#design/patterns/pickers.html) to confirm an action. *Example: confirming the deletion of a document.*

It’s worth spending some time reviewing functionality such as invoice creation and viewing in Tradeshift to see these principles in action.

![Buttons in the TopBar on a tablet](assets/img/nexus_7_createinvoice2.png)

![Buttons in the TopBar on desktop](assets/img/button-styles-01.png)

Above is the invoice creation screen. The *Send button* is primary for this functionality. *Preview* is secondary and *Discard* is tertiary. A number of other tertiary actions are grouped within the triple-dot (···) icon. These are actions such as importing document contents from a file, sending a test email with the document attached, etc.

![Kill button to discard a document](assets/img/button-styles-02-kill.png)

Above is a *Kill button* which confirms the action of deleting a document. It’s styled to indicate the destructive nature of it’s action.

> ###### Copy Guidelines
> Use the following guidelines to write good button copy:
> 
>   1. **Be descriptive.** The button should explain clearly what will happen once it’s pressed. A user should never be surprised after clicking a button, and they should never be scared of clicking a button. Example: test users were repeatedly afraid of clicking ‘proceed’ during a complex task involving multiple documents, as they were not sure whether ‘proceed’ would take them to the next step in the current document, or to the next document altogether.
>   2. **Consider the entire flow.** Buttons should match the titles of the pages or pickers they open, and as a whole should tie the flow together.
>   3. **Be context specific.** If there’s an action, include the verb in the button. Only write generics like ‘done’ when there’s absolutely no better option. Example: a picker where a user can select multiple options can be closed with ‘done’. When something is being sent, rejected, accepted, forwarded, assigned, reassigned, shared, or any other action, then be specific!
> 
> Buttons should always be written in the first person. Buttons are the user speaking, so they should not say “Go to your profile”, they should say “Go to my profile”
> 
> Read more about [in-depth copy guidelines for buttons](http://tradeshift.github.io/#design/copy/buttons.html)

###### 

> ###### For Developers
> Read more about [Buttons](//tradeshift.github.io/#components/buttons/index.html) and [Buttons in the TopBar](//tradeshift.github.io/#components/topbar/buttons.html).

------------------------------------------------------------------------
Continue reading our Design Patterns on the [Option Lists & Pickers](//tradeshift.github.io/#design/patterns/pickers.html) page.
