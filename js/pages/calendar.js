import { initCalendarPageAll, renderCalendarPage } from "../components/calendarPage.js";

export function pageCalendar() {
  return { html: renderCalendarPage(), afterMount() { initCalendarPageAll(); } };
}

