import { useEffect, useState } from "react";
import { fetchToday, fetchSlots } from "./api.js";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const WEEKDAYS_FULL = [
  "воскресенье", "понедельник", "вторник", "среда",
  "четверг", "пятница", "суббота",
];

function toDate({ day, month, year }) {
  return new Date(year, month, day);
}

function dateKey({ day, month, year }) {
  return `${year}-${month}-${day}`;
}

function formatDate({ day, month, year }) {
  return `${day} ${MONTHS_GENITIVE[month]} ${year}`;
}

function sameDate(first, second) {
  return Boolean(
    first &&
    second &&
    first.day === second.day &&
    first.month === second.month &&
    first.year === second.year
  );
}

function App() {
  // Дата и состояния загрузки первого запроса.
  const [today, setToday] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState("");
  const [todayRetry, setTodayRetry] = useState(0);

  // Выбранная дата и отображаемый месяц.
  const [selectedDate, setSelectedDate] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  // Состояния загрузки слотов.
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotsRetry, setSlotsRetry] = useState(0);

  // Шаг 1. Получаем сегодняшнюю дату с сервера.
  useEffect(() => {
    let cancelled = false;

    async function loadToday() {
      setTodayLoading(true);
      setTodayError("");

      try {
        const data = await fetchToday();

        if (
          !Number.isInteger(data.day) ||
          !Number.isInteger(data.month) ||
          !Number.isInteger(data.year) ||
          data.month < 0 ||
          data.month > 11
        ) {
          throw new Error("Сервер вернул некорректную дату.");
        }

        if (cancelled) return;

        setToday(data);
        setSelectedDate(data);
        setVisibleMonth(new Date(data.year, data.month, 1));
        setSelectedTime("");
      } catch (error) {
        if (!cancelled) {
          setTodayError(
            error.message || "Не удалось загрузить сегодняшнюю дату."
          );
        }
      } finally {
        if (!cancelled) {
          setTodayLoading(false);
        }
      }
    }

    loadToday();

    return () => {
      cancelled = true;
    };
  }, [todayRetry]);

  // Шаг 2. Загружаем слоты при первом выборе даты
  // и при каждом последующем изменении выбранного дня.
  useEffect(() => {
    if (!selectedDate) return;

    let cancelled = false;
    const requestedDate = { ...selectedDate };

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError("");
      setSlots([]);
      setSelectedTime("");

      try {
        const data = await fetchSlots(requestedDate);

        // Проверяем, что сервер вернул данные именно для запроса.
        if (!sameDate(data.date, requestedDate)) {
          throw new Error("Сервер вернул слоты для другой даты.");
        }

        if (!Array.isArray(data.slots)) {
          throw new Error("Сервер вернул некорректный список слотов.");
        }

        // Если пользователь уже выбрал другую дату,
        // игнорируем запоздавший ответ.
        if (cancelled) return;

        setSlots(data.slots);
      } catch (error) {
        if (!cancelled) {
          setSlotsError(
            error.message || "Не удалось загрузить время записи."
          );
        }
      } finally {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, slotsRetry]);

  function changeMonth(direction) {
    setVisibleMonth((current) => {
      if (!current || !today) return current;

      const next = new Date(
        current.getFullYear(),
        current.getMonth() + direction,
        1
      );

      const firstAllowedMonth = new Date(today.year, today.month, 1);

      if (next < firstAllowedMonth) return current;

      return next;
    });
  }

  function selectDay(day) {
    if (!visibleMonth || !today) return;

    const newDate = {
      day,
      month: visibleMonth.getMonth(),
      year: visibleMonth.getFullYear(),
    };

    if (toDate(newDate) < toDate(today)) return;
    if (sameDate(newDate, selectedDate)) return;

    setSelectedDate(newDate);
    setSelectedTime("");
  }

  function handleContinue() {
    if (!selectedDate || !selectedTime) return;

    alert(
      `Вы выбрали запись на ${formatDate(selectedDate)} в ${selectedTime}.`
    );
  }

  // Пока сервер определяет сегодняшнюю дату — не рисуем календарь.
  if (todayLoading) {
    return (
      <div className="app">
        <main className="status-screen">
          <div className="status-card">
            <div className="loader" />
            <h1>Загрузка…</h1>
            <p>Получаем актуальную дату с сервера.</p>
          </div>
        </main>
      </div>
    );
  }

  if (todayError) {
    return (
      <div className="app">
        <main className="status-screen">
          <div className="status-card error-card">
            <span className="status-symbol">!</span>
            <h1>Не удалось загрузить страницу</h1>
            <p>{todayError}</p>
            <button
              className="continue-button"
              onClick={() => setTodayRetry((value) => value + 1)}
            >
              Повторить запрос
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!today || !selectedDate || !visibleMonth) return null;

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const previousMonthDisabled =
    year === today.year && month <= today.month;

  return (
    <div className="app">
      <header className="site-header">
        <a className="logo" href="#top" aria-label="На главную">
          <span className="logo-mark">B</span>
          <span className="logo-copy">
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
              <h3>{MONTHS[month]} {year}</h3>
              <div className="month-navigation">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  disabled={previousMonthDisabled}
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

                const date = { day, month, year };
                const past = toDate(date) < toDate(today);
                const selected = sameDate(date, selectedDate);
                const isToday = sameDate(date, today);

                return (
                  <button
                    type="button"
                    className={[
                      "day",
                      past ? "past" : "",
                      selected ? "selected" : "",
                      isToday ? "today" : "",
                    ].filter(Boolean).join(" ")}
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
              <span><i className="legend-dot available" />Доступно</span>
              <span><i className="legend-dot chosen" />Выбрано</span>
              <span><i className="legend-dot" />Недоступно</span>
            </div>

            <p className="calendar-note">
              Сегодняшняя дата получена с сервера. Прошедшие дни выбрать нельзя.
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
              Выберите подходящий интервал для записи.
            </p>

            {slotsLoading ? (
              <div className="inline-status" role="status">
                <div className="loader small-loader" />
                <span>Загрузка слотов…</span>
              </div>
            ) : slotsError ? (
              <div className="inline-error" role="alert">
                <p>Не удалось загрузить слоты.</p>
                <span>{slotsError}</span>
                <button
                  type="button"
                  className="retry-button"
                  onClick={() => setSlotsRetry((value) => value + 1)}
                >
                  Повторить запрос
                </button>
              </div>
            ) : slots.length === 0 ? (
              <p className="no-slots">На эту дату нет доступных интервалов.</p>
            ) : (
              <div className="time-slots">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot.time}
                    className={[
                      "time-slot",
                      selectedTime === slot.time ? "selected-time-slot" : "",
                      !slot.available ? "unavailable" : "",
                    ].filter(Boolean).join(" ")}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    aria-pressed={selectedTime === slot.time}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}

            {selectedTime && !slotsLoading && !slotsError && (
              <p className="selected-caption">
                Выбрано время: {selectedTime}
              </p>
            )}

            <p className="time-hint">
              Слоты загружаются с сервера отдельно для каждой даты.
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
              <span className="summary-secondary">Мужская парикмахерская</span>
            </div>

            <div className="summary-section">
              <span className="summary-label">Дата</span>
              <strong>{formatDate(selectedDate)}</strong>
              <span className="summary-secondary">
                {WEEKDAYS_FULL[toDate(selectedDate).getDay()]}
              </span>
            </div>

            <div className="summary-section">
              <span className="summary-label">Время</span>
              <strong>{selectedTime || "Время не выбрано"}</strong>
              <span className="summary-secondary">
                {selectedTime ? "Выбранный интервал" : "Выберите свободный интервал"}
              </span>
            </div>

            <div className="summary-benefit">
              <strong>Отличный выбор!</strong>
              <br />
              Выберите дату и доступное время, чтобы продолжить.
            </div>

            <button
              type="button"
              className="continue-button"
              disabled={!selectedTime || slotsLoading || Boolean(slotsError)}
              onClick={handleContinue}
            >
              Продолжить →
            </button>

            <p className="summary-terms">
              Демонстрационная форма: запись не отправляется в реальную систему.
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