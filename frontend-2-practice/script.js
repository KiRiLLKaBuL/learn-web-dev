/* =====================================
   1. ДАННЫЕ
   ===================================== */

const MONTHS_NOMINATIVE = [
  "январь", "февраль", "март", "апрель",
  "май", "июнь", "июль", "август",
  "сентябрь", "октябрь", "ноябрь", "декабрь"
];

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля",
  "мая", "июня", "июля", "августа",
  "сентября", "октября", "ноября", "декабря"
];

const DAYS_OF_WEEK = [
  "воскресенье", "понедельник", "вторник",
  "среда", "четверг", "пятница", "суббота"
];

const DAYS_OF_WEEK_NOMINATIVE = [
  "Воскресенье", "Понедельник", "Вторник",
  "Среда", "Четверг", "Пятница",
  "Суббота"
];

const ALL_SLOTS = [
  { time: "10:00", available: false },
  { time: "11:30", available: true },
  { time: "12:00", available: true },
  { time: "13:00", available: true },
  { time: "14:30", available: true },
  { time: "16:00", available: true },
  { time: "17:30", available: true },
  { time: "18:00", available: true },
  { time: "19:30", available: true }
];

const now = new Date();

const today = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
);


/* =====================================
   2. СОСТОЯНИЕ
   ===================================== */

const state = {
  currentMonth: today.getMonth(),
  currentYear: today.getFullYear(),
  selectedDay: today.getDate(),
  selectedTime: null,
  slots: []
};


/* =====================================
   3. ЭЛЕМЕНТЫ СТРАНИЦЫ
   ===================================== */

const monthTitle = document.querySelector("#monthTitle");
const calendarDays = document.querySelector("#calendarDays");

const prevMonthButton = document.querySelector("#prevMonth");
const nextMonthButton = document.querySelector("#nextMonth");

const calendarLegend = document.querySelector("#calendarLegend");
const selectedDateHeading = document.querySelector("#selectedDateHeading");

const timeSlots = document.querySelector("#timeSlots");
const selectedCaption = document.querySelector("#selectedCaption");
const summaryDate = document.querySelector("#summaryDate");

const continueButton = document.querySelector("#continueButton");


/* =====================================
   4. ФУНКЦИИ РАБОТЫ С ДАТАМИ
   ===================================== */

// Создание календарной сетки.
// Неделя начинается с понедельника.

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const offset = startDayOfWeek === 0
    ? 6
    : startDayOfWeek - 1;

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  // Дни предыдущего месяца.

  for (let i = offset - 1; i >= 0; i--) {
    cells.push({
      day: prevMonthLastDay - i,
      otherMonth: true,
      monthOffset: -1
    });
  }

  // Дни текущего месяца.

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day: day,
      otherMonth: false,
      monthOffset: 0
    });
  }

  // Дни следующего месяца.

  let nextDay = 1;

  while (cells.length % 7 !== 0) {
    cells.push({
      day: nextDay,
      otherMonth: true,
      monthOffset: 1
    });

    nextDay++;
  }

  // Разделяем дни на недели.

  const weeks = [];

  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}


// Сравнение дат без учёта времени.

function compareDates(date1, date2) {
  const first = new Date(
    date1.getFullYear(),
    date1.getMonth(),
    date1.getDate()
  ).getTime();

  const second = new Date(
    date2.getFullYear(),
    date2.getMonth(),
    date2.getDate()
  ).getTime();

  return first - second;
}


// Проверка, доступна ли дата для выбора.

function isDateSelectable(day, month, year, currentDate) {
  const date = new Date(year, month, day);

  return compareDates(date, currentDate) >= 0;
}


// Получение выбранной даты.

function getSelectedDate() {
  return new Date(
    state.currentYear,
    state.currentMonth,
    state.selectedDay
  );
}


// Форматирование времени окончания записи.

function getEndTime(time, durationMinutes = 60) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date(
    2000,
    0,
    1,
    hours,
    minutes + durationMinutes
  );

  return [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0")
  ].join(":");
}


/* =====================================
   5. ДОСТУПНЫЕ СЛОТЫ
   ===================================== */

function getSlotsForDate(day, month, year) {
  const date = new Date(year, month, day);

  // Нельзя записаться на прошедшую дату.

  if (compareDates(date, today) < 0) {
    return [];
  }

  return ALL_SLOTS.map((slot, index) => {
    let available = slot.available;

    // Некоторые слоты заняты для демонстрации.

    if ((day + index) % 7 === 0) {
      available = false;
    }

    // Учитываем исходно занятые слоты.

    if (!slot.available) {
      available = false;
    }

    // Сегодня нельзя выбрать уже прошедшее время.

    if (compareDates(date, today) === 0) {
      const [hours, minutes] = slot.time
        .split(":")
        .map(Number);

      const slotDate = new Date(
        year,
        month,
        day,
        hours,
        minutes
      );

      if (slotDate <= now) {
        available = false;
      }
    }

    return {
      time: slot.time,
      available: available
    };
  });
}


/* =====================================
   6. ОТРИСОВКА КАЛЕНДАРЯ
   ===================================== */

function renderCalendar() {
  const monthName = MONTHS_NOMINATIVE[state.currentMonth];

  monthTitle.textContent =
    monthName.charAt(0).toUpperCase() +
    monthName.slice(1) +
    " " +
    state.currentYear;

  const weeks = buildCalendarGrid(
    state.currentYear,
    state.currentMonth
  );

  // Создаём HTML календаря.

  calendarDays.innerHTML = weeks.flat().map(cell => {
    const cellDate = new Date(
      state.currentYear,
      state.currentMonth + cell.monthOffset,
      cell.day
    );

    const selectable = isDateSelectable(
      cellDate.getDate(),
      cellDate.getMonth(),
      cellDate.getFullYear(),
      today
    );

    const isSelected =
      !cell.otherMonth &&
      cell.day === state.selectedDay;

    const classes = ["day"];

    if (cell.otherMonth) {
      classes.push("muted");
    }

    if (isSelected) {
      classes.push("selected");
    }

    return `
      <button
        class="${classes.join(" ")}"
        type="button"
        data-day="${cell.day}"
        data-month-offset="${cell.monthOffset}"
        ${selectable ? "" : "disabled"}
        aria-pressed="${isSelected}"
        aria-label="${cell.day} ${MONTHS_GENITIVE[cellDate.getMonth()]}"
      >${cell.day}</button>
    `;
  }).join("");

  // После перерисовки добавляем обработчики кликов.

  calendarDays.querySelectorAll(".day:not(:disabled)")
    .forEach(button => {
      button.addEventListener("click", onDayClick);
    });

  // Нельзя переходить к месяцам раньше текущего.

  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const displayedMonth = new Date(
    state.currentYear,
    state.currentMonth,
    1
  );

  prevMonthButton.disabled =
    displayedMonth <= firstDayOfCurrentMonth;
}


/* =====================================
   7. ВЫБОР ДАТЫ
   ===================================== */

function onDayClick(event) {
  const button = event.currentTarget;

  const day = Number(button.dataset.day);
  const monthOffset = Number(button.dataset.monthOffset);

  const clickedDate = new Date(
    state.currentYear,
    state.currentMonth + monthOffset,
    day
  );

  if (compareDates(clickedDate, today) < 0) {
    return;
  }

  state.currentYear = clickedDate.getFullYear();
  state.currentMonth = clickedDate.getMonth();
  state.selectedDay = clickedDate.getDate();

  // Сбрасываем время при смене даты.

  state.selectedTime = null;

  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
}


/* =====================================
   8. ОТРИСОВКА СЛОТОВ
   ===================================== */

function renderTimeSlots() {
  state.slots = getSlotsForDate(
    state.selectedDay,
    state.currentMonth,
    state.currentYear
  );

  const date = getSelectedDate();

  selectedDateHeading.textContent =
    DAYS_OF_WEEK_NOMINATIVE[date.getDay()] +
    ", " +
    date.getDate() +
    " " +
    MONTHS_GENITIVE[date.getMonth()];

  // Если доступного времени нет, показываем сообщение.

  if (!state.slots.some(slot => slot.available)) {
    timeSlots.innerHTML = `
      <p class="no-slots">
        На эту дату нет доступного времени.
        Попробуйте выбрать другой день.
      </p>
    `;

    return;
  }

  // Создаём кнопки времени.

  timeSlots.innerHTML = state.slots.map(slot => {
    const selected = slot.time === state.selectedTime;

    const classes = ["time-slot"];

    if (!slot.available) {
      classes.push("busy");
    }

    if (selected) {
      classes.push("selected-time-slot");
    }

    return `
      <button
        class="${classes.join(" ")}"
        type="button"
        data-time="${slot.time}"
        ${slot.available ? "" : "disabled"}
        aria-pressed="${selected}"
      >${slot.time}</button>
    `;
  }).join("");

  // Добавляем обработчики после создания кнопок.

  timeSlots.querySelectorAll(".time-slot:not(:disabled)")
    .forEach(button => {
      button.addEventListener("click", onTimeSlotClick);
    });
}


/* =====================================
   9. ВЫБОР ВРЕМЕНИ
   ===================================== */

function onTimeSlotClick(event) {
  const button = event.currentTarget;
  const time = button.dataset.time;

  const slot = state.slots.find(item => item.time === time);

  if (!slot || !slot.available) {
    return;
  }

  state.selectedTime = time;

  renderTimeSlots();
  updateBottomBar();
}


/* =====================================
   10. ОБНОВЛЕНИЕ СВОДКИ ЗАПИСИ
   ===================================== */

function updateBottomBar() {
  const date = getSelectedDate();

  const fullDate =
    DAYS_OF_WEEK_NOMINATIVE[date.getDay()] +
    ", " +
    date.getDate() +
    " " +
    MONTHS_GENITIVE[date.getMonth()] +
    " " +
    date.getFullYear();

  // Подпись под календарём.

  calendarLegend.textContent =
    date.getDate() +
    " " +
    MONTHS_GENITIVE[date.getMonth()] +
    " · " +
    DAYS_OF_WEEK[date.getDay()];

  if (state.selectedTime) {
    const endTime = getEndTime(state.selectedTime);

    selectedCaption.innerHTML =
      `<span>✓</span> Выбрано: ${state.selectedTime}–${endTime}`;

    summaryDate.textContent =
      date.getDate() +
      " " +
      MONTHS_GENITIVE[date.getMonth()] +
      ", " +
      DAYS_OF_WEEK[date.getDay()] +
      " · " +
      state.selectedTime;
  } else {
    selectedCaption.innerHTML =
      "<span>✓</span> Выберите время";

    summaryDate.textContent = fullDate + " · время не выбрано";
  }
}


/* =====================================
   11. ПЕРЕКЛЮЧЕНИЕ МЕСЯЦЕВ
   ===================================== */

function changeMonth(offset) {
  const nextDate = new Date(
    state.currentYear,
    state.currentMonth + offset,
    1
  );

  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  // Не разрешаем переходить в прошлые месяцы.

  if (nextDate < firstDayOfCurrentMonth) {
    return;
  }

  state.currentMonth = nextDate.getMonth();
  state.currentYear = nextDate.getFullYear();

  // Для текущего месяца выбираем сегодня.
  // Для будущего — первое число месяца.

  if (
    state.currentYear === today.getFullYear() &&
    state.currentMonth === today.getMonth()
  ) {
    state.selectedDay = today.getDate();
  } else {
    state.selectedDay = 1;
  }

  state.selectedTime = null;

  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
}


function setupMonthNavigation() {
  prevMonthButton.addEventListener("click", () => {
    changeMonth(-1);
  });

  nextMonthButton.addEventListener("click", () => {
    changeMonth(1);
  });
}


/* =====================================
   12. КНОПКА «ПРОДОЛЖИТЬ»
   ===================================== */

function setupContinueButton() {
  continueButton.addEventListener("click", event => {
    event.preventDefault();

    if (!state.selectedTime) {
      alert("Пожалуйста, выберите дату и доступное время.");
      return;
    }

    const date = getSelectedDate();

    alert(
      "Дата и время выбраны!\n" +
      date.getDate() +
      " " +
      MONTHS_GENITIVE[date.getMonth()] +
      " " +
      date.getFullYear() +
      " в " +
      state.selectedTime +
      ".\n\n" +
      "Теперь можно переходить к следующему этапу записи."
    );
  });
}


/* =====================================
   13. ИНИЦИАЛИЗАЦИЯ
   ===================================== */

function init() {
  state.currentMonth = today.getMonth();
  state.currentYear = today.getFullYear();
  state.selectedDay = today.getDate();

  // Ищем ближайшую дату с доступным временем,
  // если на сегодня все слоты уже заняты.

  for (let i = 0; i < 30; i++) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + i
    );

    const slots = getSlotsForDate(
      date.getDate(),
      date.getMonth(),
      date.getFullYear()
    );

    if (slots.some(slot => slot.available)) {
      state.currentMonth = date.getMonth();
      state.currentYear = date.getFullYear();
      state.selectedDay = date.getDate();

      break;
    }
  }

  state.slots = getSlotsForDate(
    state.selectedDay,
    state.currentMonth,
    state.currentYear
  );

  // При открытии страницы выбираем первый доступный слот.

  state.selectedTime =
    state.slots.find(slot => slot.available)?.time ?? null;

  renderCalendar();
  renderTimeSlots();
  updateBottomBar();

  setupMonthNavigation();
  setupContinueButton();
}


// Запускаем код после загрузки HTML.

document.addEventListener("DOMContentLoaded", init);