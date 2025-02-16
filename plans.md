
# Plans

I'm not making issues in Github for these things because the app/project isn't formal enough to warrent that. Contributions are welcome though! If you are interested in doing any of this, feel free to open an issue to ask questions of discuss plans.

## Stuff I definitely want to do
* Make it not-ugly
* More metadata about predictions (probably use TanStack table) starting with author and date prediction was made
* Show "upvotes"/"downvotes" (based on people who respond with "I predict this is right/wrong")

## Stuff I probably want to do

* Keep predictions in a db (supabase or similar) and do scraping periodically instead of on every page load
* Show "related predictions" based on responses to the original prediction post that have their own predictions
* Allow predictions to have a "deadline" by which the author thinks they will be proven right

## Scratchpad of thoughts

Should it be possible to upvote/downvote preditions through the app, so you don't have to clutter your feed? I think no at first for simplicity, since this is supposed to be a social app. I also don't want to deal with signing in to the app.

Should this app have its own db to persist, instead of using REST to get all notifications every time the page loads? Yes, definitely if we get to any reasonable scale. I don't think there's a way to only get notifications that happened since a specific time, so maybe the data scraping should only happen on a certain interval, or with a manual refresh by admins (me). 
Even if we did get new notifications, I would still want to re-scan the replies to old notifications (unless even replies need to have the "@")

Is there a way to attribute a prediction to someone? For example, a podcaster or CEO (*caugh* Elon) who makes a public promise about someone?
I would want this to require a clear attribution of the original prediction, and don't want to be responsible for fact-checking and stuff
