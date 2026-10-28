import { useState } from "react";

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const WEEKDAYS_FULL = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
];

const TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDay(first, second) {
  return getDateKey(first) === getDateKey(second);
}

function formatDate(date) {
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}

function App() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  function changeMonth(direction) {
    setVisibleMonth(new Date(year, month + direction, 1));
  }

  function selectDay(day) {
    const newDate = new Date(year, month, day);
    newDate.setHours(0, 0, 0, 0);

    if (newDate < today) return;

    setSelectedDate(newDate);
    setSelectedTime("");
  }

  function isPastTime(time) {
    if (!isSameDay(selectedDate, today)) return false;

    const [hours, minutes] = time.split(":").map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate <= new Date();
  }

  function handleContinue() {
    if (!selectedDate || !selectedTime) return;

    alert(
      `Вы выбрали запись на ${formatDate(selectedDate)} в ${selectedTime}.`
    );
  }

  return (
    <div className="app">
      <header className="site-header">
        <a className="logo" href="#top" aria-label="На главную">
          <span className="logo-mark">B</span>

          <span>
            <span className="logo-text">BRUT Barbershop</span>
            <span className="logo-caption">Мужской стиль и уход</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Основная навигация">
          <a href="#booking">Запись</a>
          <a href="#calendar">Дата</a>
          <a href="#time">Время</a>
        </nav>

        <a className="header-phone" href="tel:+78005553535">
          +7 (800) 555-35-35
        </a>
      </header>

      <main className="booking-page" id="top">
        <section className="booking-intro" id="booking">
          <div className="eyebrow">BRUT BARBERSHOP / ONLINE</div>

          <h1>Запись к барберу</h1>

          <p className="intro-description">
            Выберите удобные дату и время. Мы подготовим всё к вашему визиту.
          </p>
        </section>

        <div className="progress-steps" aria-label="Этапы записи">
          <div className="step completed">
            <span className="step-number">1</span>
            <span>Услуга</span>
          </div>

          <div className="step-line" />

          <div className="step current">
            <span className="step-number">2</span>
            <span>Дата и время</span>
          </div>

          <div className="step-line" />

          <div className="step upcoming">
            <span className="step-number">3</span>
            <span>Подтверждение</span>
          </div>
        </div>

        <section className="booking-layout">
          <div className="card calendar-card" id="calendar">
            <div className="card-heading">
              <span className="heading-icon">▦</span>
              <div>
                <h2>Выберите дату</h2>
                <p>Доступные дни для записи</p>
              </div>
            </div>

            <div className="calendar-header">
              <h3>
                {MONTHS[month]} {year}
              </h3>

              <div className="month-navigation">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  disabled={
                    year < today.getFullYear() ||
                    (year === today.getFullYear() && month <= today.getMonth())
                  }
                  aria-label="Предыдущий месяц"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Следующий месяц"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="weekdays">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="calendar-days">
              {calendarCells.map((day, index) => {
                if (day === null) {
                  return (
                    <span
                      className="day muted"
                      key={`empty-${index}`}
                      aria-hidden="true"
                    />
                  );
                }

                const date = new Date(year, month, day);
                date.setHours(0, 0, 0, 0);

                const past = date < today;
                const selected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);

                return (
                  <button
                    type="button"
                    className={[
                      "day",
                      past ? "past" : "",
                      selected ? "selected" : "",
                      isToday ? "today" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={day}
                    disabled={past}
                    onClick={() => selectDay(day)}
                    aria-pressed={selected}
                    aria-label={`${day} ${MONTHS_GENITIVE[month]} ${year}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="calendar-legend">
              <span>
                <i className="legend-dot available" />
                Доступно
              </span>

              <span>
                <i className="legend-dot chosen" />
                Выбрано
              </span>

              <span>
                <i className="legend-dot" />
                Недоступно
              </span>
            </div>

            <p className="calendar-note">
              Прошедшие даты недоступны для выбора. При смене даты время нужно
              выбрать заново.
            </p>
          </div>

          <div className="card time-card" id="time">
            <div className="card-heading">
              <span className="heading-icon">◷</span>
              <div>
                <h2>Выберите время</h2>
                <p>Свободные интервалы</p>
              </div>
            </div>

            <div className="selected-date-caption">
              <span className="caption-calendar">▦</span>
              <span>{formatDate(selectedDate)}</span>
            </div>

            <p className="time-description">
              Нажмите на подходящее время, чтобы выбрать интервал записи.
            </p>

            <div className="time-slots">
              {TIMES.map((time) => {
                const disabled = isPastTime(time);
                const selected = selectedTime === time;

                return (
                  <button
                    type="button"
                    key={time}
                    className={[
                      "time-slot",
                      selected ? "selected-time-slot" : "",
                      disabled ? "unavailable" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={disabled}
                    onClick={() => setSelectedTime(time)}
                    aria-pressed={selected}
                  >
                    {time}
                  </button>
                );
              })}
            </div>

            {selectedTime && (
              <p className="selected-caption">
                Выбрано время: {selectedTime}
              </p>
            )}

            <p className="time-hint">
              Время указано по местному часовому поясу. Если вы измените дату,
              выбранный интервал сбросится.
            </p>
          </div>

          <aside className="card summary-card">
            <div className="summary-top">
              <span className="summary-icon">✓</span>
              <div>
                <h2>Ваша запись</h2>
                <p>Проверьте выбранные данные</p>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-section">
              <span className="summary-label">Место</span>
              <strong>BRUT Barbershop</strong>
              <span className="summary-secondary">
                Мужская парикмахерская
              </span>
            </div>

            <div className="summary-section">
              <span className="summary-label">Дата</span>
              <strong>{formatDate(selectedDate)}</strong>
              <span className="summary-secondary">
                {WEEKDAYS_FULL[selectedDate.getDay()]}
              </span>
            </div>

            <div className="summary-section">
              <span className="summary-label">Время</span>
              <strong>{selectedTime || "Время не выбрано"}</strong>
              <span className="summary-secondary">
                {selectedTime
                  ? "Выбранный интервал"
                  : "Выберите свободный интервал"}
              </span>
            </div>

            <div className="summary-benefit">
              <strong>Отличный выбор!</strong>
              <br />
              Выберите дату и время — и переходите к подтверждению записи.
            </div>

            <button
              type="button"
              className="continue-button"
              disabled={!selectedTime}
              onClick={handleContinue}
            >
              Продолжить →
            </button>

            <p className="summary-terms">
              Это демонстрационная форма. Запись пока не отправляется в
              реальную систему бронирования.
            </p>
          </aside>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="footer-logo">B</span>
          <strong>BRUT Barbershop</strong>
        </div>

        <span className="footer-copy">
          © {new Date().getFullYear()} BRUT Barbershop
        </span>
      </footer>
    </div>
  );
}

export default App;