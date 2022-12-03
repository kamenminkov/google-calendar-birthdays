const GOOGLE_CALENDAR_ID_SUFFIX = /.+@group.calendar.google.com/;
const DESTINATION_NOTIFICATION_CALENDAR_URL = getScriptProperty(
	"DESTINATION_NOTIFICATION_CALENDAR_URL",
);

type Birthday = {
	name: string;
	birthday: GoogleAppsScript.Contacts.DateField;
};

function init(): void {
	if (DESTINATION_NOTIFICATION_CALENDAR_URL === null) {
		throw "You haven't set the `DESTINATION_NOTIFICATION_CALENDAR_URL` script property.";
	} else if (!calendarUrlIsValid(DESTINATION_NOTIFICATION_CALENDAR_URL)) {
		throw "Calendar URL doesn't match the pattern. Make sure that it ends in `@group.calendar.google.com`.";
	}

	const contacts = ContactsApp.getContacts();
	const contactBirthdays = getBirthdaysFromContacts(contacts);

	// TODO: Check for existing events and only update what's needed
	updateNotificationsCalendar(
		contactBirthdays,
		DESTINATION_NOTIFICATION_CALENDAR_URL,
	);
}

function getScriptProperty(propertyName: string): string | null {
	return PropertiesService.getScriptProperties().getProperty(propertyName);
}

function getBirthdaysFromContacts(
	contacts: GoogleAppsScript.Contacts.Contact[],
): Birthday[] {
	return contacts
		.filter((c) => c.getDates().length)
		.map((c) => {
			const contactName = c.getFullName();
			const birthday = c.getDates(
				ContactsApp.Field.BIRTHDAY as unknown as string,
			)[0]; // people normally have just one birthday, right?

			// const D = birthday.getDay();
			// const M = birthday.getMonth().toLocaleString();
			// const Y = birthday.getYear();

			return { name: contactName, birthday: birthday };
		});
}

function updateNotificationsCalendar(
	birthdays: Birthday[],
	calendarId: string,
): void {
	for (const event of birthdays) {
		const eventName = event.name;
		const start = getBirthdayDateTimeForEvent(event.birthday);

		const newEvent: GoogleAppsScript.Calendar.Schema.Event = {
			summary: eventName,
			start: { dateTime: start.toISOString() },
			end: { dateTime: start.toISOString() },
			reminders: {
				useDefault: false,
				overrides: [
					{
						minutes: 24 * 60,
						method: "popup",
					},
					{
						minutes: 0,
						method: "popup",
					},
				],
			},
		};

		try {
			Calendar.Events?.insert(newEvent, encodeURI(calendarId));
		} catch (err) {
			console.error(err);
		}
	}
}

function getBirthdayDateTimeForEvent(
	birthday: GoogleAppsScript.Contacts.DateField,
	hour: number = 10,
): Date {
	const date = new Date();

	const day = birthday.getDay();
	const month = getMonthOrdinal(birthday.getMonth());

	date.setDate(day);
	date.setMonth(month);

	date.setHours(hour);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);

	return date;
}

function getMonthOrdinal(month: GoogleAppsScript.Base.Month): number {
	// TODO: Find proper type for month
	return (month as any).ordinal();
}

function calendarUrlIsValid(calendarId: string): boolean {
	return calendarId.match(GOOGLE_CALENDAR_ID_SUFFIX) !== null;
}
