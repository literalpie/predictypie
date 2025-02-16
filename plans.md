Should it be possible to upvote/downvote preditions through the app, so you don't have to clutter your feed? I think no at first for simplicity, since this is supposed to be a social app. I also don't want to deal with signing in to the app at first.

Should this app have its own db to persist, instead of using REST to get all notifications every time the page loads? Yes, definitely if we get to any reasonable scale. I don't think there's a way to only get notifications that happened since a specific time, so maybe the data scraping should only happen on a certain interval, or with a manual refresh by me. 
Even if we did get new notifications, I would still want to re-scan the replies to old notifications (unless even replies need to have the "@")

It would be cool if predictions could be made in response to other predictions. When viewing the details page of the original prediction, it should list the related prediction.