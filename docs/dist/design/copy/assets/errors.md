# Error Messages

Error messages are extremely important, yet they are the ones that are most often done carelessly or as an afterthought. Error messages are what stands between a user continuing to be a user when something goes wrong, and that user giving the program another chance. Error messages are the copy that appears at the worst possible time. Whatever it was that the user wanted to achieve was not achieved. At best, the outcome is irrelevant, and at worst, work, time, or worse may have been wasted. As such, error messages should do everything possible to convince the user to give the software another shot. Error messages should be then short and amazingly precise embodiments of the copy principles.

What should an error message do?

1. **Be informative and concise.** Both of these are equally important. Both extremes are problematic. Too concise results in poor information transfer. The most important thing is that the user knows what went wrong, and what they should do next. An error message that is too concise thus won’t give enough information. For example:

> ##### Bad Copy
> “Something is broken :(“

This error message is certainly concise, but it does not provide the user with any information besides the fact that their desired and expected outcome did not occur. Conversely, it can also be that an error message has too much information, or information that is not easily decipherable. An error message with too much information might read like:

> ##### Bad Copy
> “The backup did not complete successfully. An error ocurred. The following information might help you resolve the error: If an MM error is returned which is not defined in the standard FsRtl filter, it is converted to one of the following errors which is guaranteed to be in the filter. In this case information is lost, however, the filter correctly handles the exception. (0xC00000EA). Backup time: 11/29/2006 11:57 AM” (Microsoft)

The important part is thus to provide enough information to give the user a clear indication of how to proceed, but not so much that the user becomes more confused, or simply gives up. An error message with the right balance of concise and informative could be:
 
> #### Good Copy
> “An error occurred while attempting to send your document. Please try again. If the issue persists, please contact our support”

2. **As with the rest of the user experience, keep in mind who is reading the error message.**

Related with the point above. You don’t want to give the old lady information that would be interesting for the developer, you want to give her the information she needs to solve her problem.

3. **Provide the user with the required steps they should take to either remedy the error, or to arrive at the intended outcome.** It is important to always include the next step, even when it is not something the user can solve themselves. The following series of examples from Tradeshift show how we took a bad error message and iterated it into a good one. At its earliest stage, the error message looked like this:

> ##### Bad Copy
> “CloudScan encountered an error while processing {Document} to {Recipient}.”

This error message is not fantastic. It makes it clear to the user which document caused the error and how the outcome differed from the intended, but it does not provide the user with any information regarding what s/he should do next. Thus, we might change it to:

> #### Good Copy
> “CloudScan encountered an error while processing {Document} to {Recipient}. The most likely reason for this error is that the PDF file is corrupted. Make sure that the PDF file can be opened in your PDF viewer.”

This is better, even though it is longer. It provides the user with a clear action to take in order to solve the problem. However, it could still be improved. As it is right now, the most likely explanation is given. But what happens if that is not the explanation? The user might open the PDF in their reader just fine. If this happens, then they are in the same place as before, without knowing what to do next. Of course, it can be that after this, we do not have a ‘next best’ explanation. However, it’s important to provide the user with a next action. In this case, we can add one more bit to our error message:

> #### Good Copy
> “CloudScan encountered an error while processing {Document} to {Recipient}. The most likely reason for this error is that the PDF file is corrupted. Make sure that the PDF file can be opened in your PDF viewer. If the issue persists, please contact support”.

It is important to give an action to the user even if we have no idea what is the correct way for the user to solve the issue. In that case, if the only solution is for the user to write support, say that! The user might do it by themselves, but it’s better that we’re offering a solution than the user thinking they have to ‘chase’ support around for a product that should be working in the first place. By doing this, we alleviate the pain that the user is experiencing due to the error. For example, this error message was shown when document delivery failed for an unknown reason:

> ##### Bad Copy
> “Unable to send document”

Now, it may very well be that we do not know why. But a user faced with this problem is completely lost. Nothing is gained by the brevity in this case. Now, if we add a few more words, we can make the user feel a lot better, even if we don’t really have any more information than ‘unknown error’:

> #### Good Copy
> “Due to an unknown error, we were unable to send the document. Please try sending it again. If the issue persists, please <link>contact support<link>”

We still don’t know the cause of the error, but two things happen here that didn’t before. First, we are honest about not knowing this, instead of looking lazy. Second, we encourage the user to ask us for help. This shows that we care, and provides a better user experience at the time where the user is at the lowest satisfaction point.


------------------------------------------------------------------------
Continue reading about our UI Copy Guidelines on the [Buttons](//tradeshift.github.io/docs/#design/copy/buttons.html) page.
