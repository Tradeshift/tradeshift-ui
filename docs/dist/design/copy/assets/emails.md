# Emails

Emails are a crucial and highly complex aspect of the product. When it comes to emails, the complexity level is very high for 2 reasons:

1. There are many fields that must be filled with text (sender, subject, headers, body, buttons, explanations)
2. Emails are consumed in a context outside Tradeshift’s control.

There are many different types of emails, and things like tone, etc. will vary depending on the goal of the email.  We’ll now go through the different elements that comprise an email. However, before doing that, two important questions must be asked:

1. Is this email necessary?
2. What is the goal of this email?

These questions may seem superfluous, but it is important to be sure that only emails that are necessary and useful to the user are sent. As such, never take for granted that an email should exist. At Tradeshift, one requirement for an email being deemed necessary is that the email has a call to action for the user – emails that do not encourage the user to take some action are not worth sending. As such, when answering the second question, it is a good idea to keep the call to action in mind – this will help in creating a good and cohesive email.

Once the purpose and call to action are determined, we can proceed to the email itself. As far as copy is concerned, there are five sections that need to be created in an email: sender, subject, title, body, and buttons. We’ll go through these one at a time.

#### Sender

This is a simple field, where consistency rules. There are two options for the sender:

* When the email is a system email that is unrelated to any other user, the sender should in most cases be Tradeshift.
* When the email is related to an interaction between users, the sender should be the user taking the action that results in an email, via Tradeshift.

#### Subject

Again, the way the subject is written will very much depend on the nature of the email. Nevertheless, the subject is crucial, since it plays the biggest role in determining whether the email will be read at all. Having amazing copy inside the email is irrelevant if the email is never opened. The most important thing to keep in mind is that emails revolve around the Call to Action (CTA). If an email does not have a relevant and important CTA, then it is not worth sending.

There are two options for how the subject line should relate to the CTA – when the action needed is critical for the continuation of a process, and when it is not. Note that this dichotomy is not necessarily the same as the action being important in a business sense – an action can be very important business-wise, but not be crucial per this definition. For example, a document being rejected in a small business context is a very important notification in a business sense, but it is not critical in terms of being a bottleneck. On the other hand, a request for changes to a supplier registration form IS critical, since the user will not be able to send invoices until the requested changes are made.

When the action is deemed critical, the action should be front-loaded in the email by being the focus of the subject line. So, in the above example of a customer requesting changes on a supplier’s registration form, the subject line would read:

> #### Good Copy
> “Your Supplier Registration form for {customer} requires some changes!”

Other examples of subject lines for critical actions could be:

> #### Good Copy
> “Action needed – Register to Nike Supplier Network”
> 
> “A document needs coding”

On the other hand, when the action is not critical, then the subject line should inform the user of the event that has occurred. The call to action can then be introduced inside the email. Subject lines for these types of email include the following:

> #### Good Copy
> “{user} has sent you an invoice”
> 
> “{user} accepted your connection request”
> 
> “Your public profile is missing your logo”

#### Title

The title section is quite a bit simpler, as it is very much tied to the subject line. The title should be very descriptive and summarize the purpose of the email for the user. What this means is that the title can to a great extent mirror the subject line. Following the examples above, email titles could read as follows:

> #### Good Copy
> **Subject:** Action needed – Register to Nike Supplier Network
> 
> **Title**: As a supplier to Nike Inc., you must complete the supplier registration on Tradeshift to be able to do business with Nike.

#### 

> #### Good Copy
> **Subject**: {user} has sent you an invoice
> 
> **Title**: {user} has sent you an invoice on Tradeshift


#### Body

The copy in the body is where the majority of the information is conveyed. This copy is also what leads the user to the button with the CTA, so this section should provide the user with all of the information they might need to click on the button. If the subject and title did not include the call to action (you have received an invoice), then it can be included here (you have received an invoice from X. Click the button below to see and accept or reject it.) If the call to action was included in the subject, then this can be repeated, along with an explanation of why the CTA is needed

#### Buttons

Currently, Tradeshift emails typically contain a single button, with the main CTA. This button should be descriptive, and tell the user exactly where in the product they will land. In terms of functionality, the button should take the user directly to the task needed – they should not have to find their way once they click the button. Thus, an email informing the user of a new item on their To Do list should have a button leading the user to the item itself, and not to the list as a whole. As for the rest, buttons on emails should follow the same guidelines as buttons in the rest of the product. Read more in the [buttons guidelines](http://tradeshift.github.io/#design/copy/buttons.html).

------------------------------------------------------------------------
This marks the end of our UI Copy Guidelines and the Design documentation in general.

Thank you for taking the time to read about how internal and 3rd party 
Tradeshift Apps should be built and hopefully learned something on the way.

Good luck designing your apps and you can always come back to these documentation pages,
we make sure to update them frequently.
