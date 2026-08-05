"use client";

import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";

export type CalendarAppointment = {
  id: string;
  start_time: string;
  status: string;
  contact: {
    name: string | null;
  } | null;
  service: {
    name: string | null;
  } | null;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_STYLES: Record<string, string> = {

  confirmed:

    "border-[#00C853] bg-[#E8F8ED] text-black",

  completed:

    "border-[#FFD600] bg-[#FFF9D6] text-black",

  cancelled:

    "border-[#FF1744] bg-[#FFE5EA] text-black",

};

export default function CalendarView({
  appointments,
  timezone,
}: {
  appointments: CalendarAppointment[];
  timezone: string;
}) {
  const now = new Date();

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const finalDayOfMonth = new Date(year, month + 1, 0);

  const startingBlankDays = firstDayOfMonth.getDay();
  const daysInMonth = finalDayOfMonth.getDate();

  const appointmentsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarAppointment[]>();

    appointments.forEach((appointment) => {
      const dateKey = formatInTimeZone(
        appointment.start_time,
        timezone,
        "yyyy-MM-dd"
      );

      const existing = grouped.get(dateKey) || [];
      existing.push(appointment);
      grouped.set(dateKey, existing);
    });

    return grouped;
  }, [appointments, timezone]);

  const selectedAppointments = selectedDate
    ? appointmentsByDay.get(selectedDate) || []
    : [];

  function previousMonth() {
    setVisibleMonth(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setVisibleMonth(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  function goToCurrentMonth() {
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(null);
  }

  const calendarCells: Array<number | null> = [];

  for (let index = 0; index < startingBlankDays; index++) {
    calendarCells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  return (
    <div className="ledger-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-ink/10 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <p className="font-inter text-xl font-semibold text-ink">
              {MONTHS[month]} {year}
            </p>

            <p className="text-xs text-inkLight">
              {appointments.length} appointments on file
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-black bg-[#03FD18]"></span>
              <span>Confirmed</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-black bg-[#fde403]"></span>
              <span>Completed</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-black bg-[#fd0331]"></span>
              <span>Cancelled</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousMonth}
            className="stamp-btn stamp-btn-available"
          >
            ←
          </button>

          <button
            type="button"
            onClick={goToCurrentMonth}
            className="stamp-btn stamp-btn-available"
          >
            Today
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="stamp-btn stamp-btn-available"
          >
            →
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 border-b border-ink/10 bg-white/40">
            {DAYS.map((day) => (
              <div
                key={day}
                className="border-r border-ink/10 px-3 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-inkLight last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarCells.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`blank-${index}`}
                    className="min-h-24 border-b border-r border-ink/10 bg-ink/[0.02]"
                  />
                );
              }

              const dateKey = [
                year,
                String(month + 1).padStart(2, "0"),
                String(day).padStart(2, "0"),
              ].join("-");

              const dayAppointments =
                appointmentsByDay.get(dateKey) || [];

              const isToday =
                day === now.getDate() &&
                month === now.getMonth() &&
                year === now.getFullYear();

              const isSelected = selectedDate === dateKey;

              return (
                <button
                  type="button"
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`min-h-24 border-b border-r border-ink/10 p-2 text-left transition-colors hover:bg-brass/5 ${
                    isSelected
                      ? "bg-brass/10 ring-2 ring-inset ring-brass/40"
                      : ""
                  }`}
                >
                  <div
                    className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-brass text-white"
                        : "text-inkLight"
                    }`}
                  >
                    {day}
                  </div>

                  <div className="space-y-1.5">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`rounded-md border px-2 py-1.5 ${
                          STATUS_STYLES[appointment.status] ||
                          "border-ink/15 bg-white/60 text-ink"
                        }`}
                      >
                        <p className="truncate text-[11px] font-semibold">
                          {formatInTimeZone(
                            appointment.start_time,
                            timezone,
                            "h:mm a"
                          )}
                        </p>

                        <p className="truncate text-[10px]">
                          {appointment.contact?.name || "Unknown guest"}
                        </p>

                        <p className="truncate text-[10px] opacity-80">
                          {appointment.service?.name || "Unknown service"}
                        </p>
                      </div>
                    ))}

                    {dayAppointments.length > 3 && (
                      <p className="px-1 text-[10px] text-inkLight">
                        +{dayAppointments.length - 3} more
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="border-t border-ink/10 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-inter text-lg font-semibold text-ink">
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </h2>

              <p className="text-xs text-inkLight">
                {selectedAppointments.length} appointment
                {selectedAppointments.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-xs text-inkLight underline hover:text-brass"
            >
              Close
            </button>
          </div>

          {selectedAppointments.length === 0 ? (
            <p className="text-sm text-inkLight">
              No appointments booked for this date.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`flex items-center justify-between rounded-md border p-3 ${
                    STATUS_STYLES[appointment.status] ||
                    "border-ink/15 bg-white/60 text-ink"
                  }`}
                >
                  <div>
                    <p className="font-inter text-sm font-semibold">
                      {appointment.contact?.name || "Unknown guest"}
                    </p>

                    <p className="text-xs opacity-80">
                      {appointment.service?.name || "Unknown service"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatInTimeZone(
                        appointment.start_time,
                        timezone,
                        "h:mm a"
                      )}
                    </p>

                    <p className="text-[10px] uppercase tracking-wide">
                      {appointment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}