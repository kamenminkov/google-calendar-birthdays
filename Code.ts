const GOOGLE_BIRTHDAYS_CALENDAR_ID = getScriptProperty(
	"GOOGLE_BIRTHDAYS_CALENDAR_ID",
) as string;
const DESTINATION_NOTIFICATION_CALENDAR_ID = getScriptProperty(
	"BIRTHDAY_NOTIFICATION_CALENDAR_ID",
) as string;

type Birthday = {
	name: string;
	birthday: GoogleAppsScript.Contacts.DateField;
};

function init() {
	if (GOOGLE_BIRTHDAYS_CALENDAR_ID === null) {
		throw new Error(
			`You haven't set the \`GOOGLE_BIRTHDAYS_CALENDAR_ID\` script property.`,
		);
	}

	if (DESTINATION_NOTIFICATION_CALENDAR_ID === null) {
		throw new Error(
			`You haven't set the \`DESTINATION_NOTIFICATION_CALENDAR_ID\` script property.`,
		);
	}

	const contacts = ContactsApp.getContacts();
	const contactBirthdays = getBirthdaysFromContacts(contacts);

	// TODO: Check for existing events and only update what's needed
	updateNotificationsCalendar(
		contactBirthdays,
		DESTINATION_NOTIFICATION_CALENDAR_ID,
	);
}

function getScriptProperty(propertyName: string) {
	return PropertiesService.getScriptProperties().getProperty(propertyName);
}

function getBirthdaysFromContacts(
	contacts: GoogleAppsScript.Contacts.Contact[],
): Birthday[] {
	return contacts
		.filter((c) => c.getDates().length)
		.map((c) => {
			const contactName = c.getFullName();

			const dates = c.getDates(ContactsApp.Field.BIRTHDAY as unknown as string);

			const date = dates[0]; // people normally have just one birthday, right?

			const D = date.getDay();
			const M = date.getMonth().toLocaleString();
			const Y = date.getYear();

			// console.log(`${contactName}: ${D}/${M}/${Y}`);

			return { name: contactName, birthday: date };
		});
}

function getExistingBirthdays() {
	const birthdaysCalendar = Calendar.Calendars?.get(
		GOOGLE_BIRTHDAYS_CALENDAR_ID,
	);

	const builtInBirthdayCalendarEvents = Calendar.Events?.list(
		GOOGLE_BIRTHDAYS_CALENDAR_ID,
	);

	const existingItems = builtInBirthdayCalendarEvents?.items?.map((item) => {
		return item;
	});

	const existingBirthdayNotificationEvents = Calendar.Events?.list(
		GOOGLE_BIRTHDAYS_CALENDAR_ID,
	);
}

function updateNotificationsCalendar(
	birthdays: Birthday[],
	calendarId: string,
) {
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
			Calendar.Events!.insert(newEvent, calendarId);
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
