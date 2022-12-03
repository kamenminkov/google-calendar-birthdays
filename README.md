## Idea

For some reason Google still won't let you have default reminders for the Birthdays calendar tied to contacts. Birthdays do show up in that built-in calendar, but you might miss them if you don't check.

This script reads your contacts, extracts the birthday dates and writes them as calendar events in a new calendar of your choosing.

## Initial Setup

1. Create a new Google calendar under your account and copy its Calendar ID (found under `Calendar settings` -> `Integrate calendar`). The ID should have 64 random letters and numbers and should end in `@group.calendar.google.com`.
2. Run `npm i` under the root of this project.
3. Open the link that's returned in the terminal. Go to `Project Settings` -> `Script Properties` and add a property `DESTINATION_NOTIFICATION_CALENDAR_URL` with the ID from step 1 as value.
4. Go back to `Editor`, click `Run` from the toolbar and allow the permissions that are asked. Until you verify the app with Google, it will be untrusted and your browser will warn you for that.
5. (Optional) You can set the script to run on a schedule. Go to `Triggers` -> `Add Trigger`, choose `init()` as the function that runs and choose for example `Time-driven` and `Day timer`. If you don't do that, you'll have to run the script every time you add new birthdays to your contacts.

## Permissions needed

- Contacts: so that birthdays of your contacts can be read
- Calendar: so that events with notifications can be written to one of your calendars

## Development

1. `npm run push-watch`: this will start clasp in watcher mode and open your browser with the script; every change you make will be pushed to Apps Script.
2. Each time you see "Pushed _n_ files" you can reload the browser and rerun the script there.
