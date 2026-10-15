import React, { useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import DictionaryCard from '../components/DictionaryCard';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

import {
  CAT_STYLES,
  MOOD_ICONS,
  MOODS,
  dateKey
} from '../data/constants';

import './DashPage.css';
import '../components/DictionaryCard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);


/* ========================================
   日付関連
======================================== */

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}


function startOfWeek(date) {
  const d = new Date(date);

  // 日曜日始まり
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);

  return d;
}


function endOfWeek(date) {
  const d = startOfWeek(date);

  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);

  return d;
}


function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


/* ========================================
   メイン
======================================== */

export default function DashPage({ entries, kb }) {

  /*
   * week
   * month
   * year
   */
  const [period, setPeriod] = useState('month');

  /*
   * 現在表示している期間の基準日
   */
  const [cursorDate, setCursorDate] =
    useState(new Date());


  /* ========================================
     表示期間に含まれる日記
  ======================================== */

  const filteredEntries = useMemo(() => {

    return entries.filter(entry => {

      const d = parseDate(entry.date);


      /* ---------- 週 ---------- */

      if (period === 'week') {

        const start =
          startOfWeek(cursorDate);

        const end =
          endOfWeek(cursorDate);

        return (
          d >= start &&
          d <= end
        );
      }


      /* ---------- 月 ---------- */

      if (period === 'month') {

        return (
          d.getFullYear() ===
            cursorDate.getFullYear() &&

          d.getMonth() ===
            cursorDate.getMonth()
        );
      }


      /* ---------- 年 ---------- */

      return (
        d.getFullYear() ===
        cursorDate.getFullYear()
      );

    });

  }, [
    entries,
    period,
    cursorDate
  ]);


  /* ========================================
     この期間の日記に関連する知識
  ======================================== */

  const filteredKB = useMemo(() => {

    const ids =
      new Set(
        filteredEntries.map(e => e.id)
      );

    return kb.filter(k =>
      ids.has(k.linkedEntryId)
    );

  }, [
    kb,
    filteredEntries
  ]);


  /* ========================================
     統計
  ======================================== */

  const stats = useMemo(() => {

    /* ---------- タグ ---------- */

    const tagCount = {};

    filteredEntries
      .flatMap(e => e.tags || [])
      .forEach(tag => {

        tagCount[tag] =
          (tagCount[tag] || 0) + 1;

      });


    const topTag =
      Object.entries(tagCount)
        .sort(
          (a, b) =>
            b[1] - a[1]
        )[0]?.[0] || '—';


    /* ---------- カテゴリ ---------- */

    const catCount = {};

    filteredEntries.forEach(e => {

      catCount[e.cat] =
        (catCount[e.cat] || 0) + 1;

    });


    /* ---------- 気分 ---------- */

    const moodCount = {};

    filteredEntries.forEach(e => {

      moodCount[e.mood] =
        (moodCount[e.mood] || 0) + 1;

    });


    return {

      total:
        filteredEntries.length,

      kb:
        filteredKB.length,

      topTag,

      tagCount,

      catCount,

      moodCount

    };

  }, [
    filteredEntries,
    filteredKB
  ]);


  /* ========================================
     前・次の期間
  ======================================== */

  const movePeriod = direction => {

    const d =
      new Date(cursorDate);


    if (period === 'week') {

      d.setDate(
        d.getDate() +
        direction * 7
      );

    }


    if (period === 'month') {

      d.setMonth(
        d.getMonth() +
        direction
      );

    }


    if (period === 'year') {

      d.setFullYear(
        d.getFullYear() +
        direction
      );

    }


    setCursorDate(d);

  };


  /* ========================================
     表示タイトル
  ======================================== */

  const periodTitle = useMemo(() => {

    const y =
      cursorDate.getFullYear();

    const m =
      cursorDate.getMonth() + 1;


    if (period === 'week') {

      const start =
        startOfWeek(cursorDate);

      const end =
        endOfWeek(cursorDate);

      return (
        `${start.getMonth() + 1}月` +
        `${start.getDate()}日〜` +
        `${end.getMonth() + 1}月` +
        `${end.getDate()}日`
      );

    }


    if (period === 'month') {

      return `${y}年${m}月`;

    }


    return `${y}年`;

  }, [
    cursorDate,
    period
  ]);


  /* ========================================
     グラフ
  ======================================== */

  const catList =
    Object.entries(stats.catCount)
      .sort(
        (a, b) =>
          b[1] - a[1]
      );


  const donutData = {

    labels:
      catList.map(x => x[0]),

    datasets: [{

      data:
        catList.map(x => x[1]),

      backgroundColor:
        catList.map(
          x =>
            CAT_STYLES[x[0]]?.dot ||
            '#888'
        ),

      borderWidth: 2,

      borderColor: '#fff',

      hoverOffset: 4

    }]

  };


  const chartOpts = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false
      }

    }

  };


  const tagsSorted =
    Object.entries(stats.tagCount)
      .sort(
        (a, b) =>
          b[1] - a[1]
      );


  const maxTag =
    tagsSorted[0]?.[1] || 1;


  return (

    <div className="dash-page">


      {/* ==================================
          期間切り替え
      ================================== */}

      <div className="dash-period-header">

        <div className="period-tabs">

          <button
            className={
              period === 'week'
                ? 'active'
                : ''
            }
            onClick={() =>
              setPeriod('week')
            }
          >
            週
          </button>


          <button
            className={
              period === 'month'
                ? 'active'
                : ''
            }
            onClick={() =>
              setPeriod('month')
            }
          >
            月
          </button>


          <button
            className={
              period === 'year'
                ? 'active'
                : ''
            }
            onClick={() =>
              setPeriod('year')
            }
          >
            年
          </button>

        </div>


        <div className="period-nav">

          <button
            onClick={() =>
              movePeriod(-1)
            }
          >
            <i className="ti ti-chevron-left" />
          </button>


          <strong>
            {periodTitle}
          </strong>


          <button
            onClick={() =>
              movePeriod(1)
            }
          >
            <i className="ti ti-chevron-right" />
          </button>

        </div>

      </div>


      {/* ==================================
          数値
      ================================== */}

      <div className="dash-metrics">

        {[
          [
            'ti-notebook',
            '日記',
            `${stats.total}件`
          ],

          [
            'ti-database',
            '知識',
            `${stats.kb}件`
          ],

          [
            'ti-tag',
            'よく使ったタグ',
            stats.topTag
          ]

        ].map(
          ([icon, label, value]) => (

            <div
              key={label}
              className="metric-card"
            >

              <div className="metric-label">

                <i
                  className={`ti ${icon}`}
                />

                {label}

              </div>

              <div className="metric-val">

                {value}

              </div>

            </div>

          )
        )}

      </div>


      {/* ==================================
          カレンダー / 年間推移
      ================================== */}

      {period === 'month' && (

        <MonthCalendar
          entries={filteredEntries}
          cursorDate={cursorDate}
        />

      )}


      {period === 'week' && (

        <WeekCalendar
          entries={filteredEntries}
          cursorDate={cursorDate}
        />

      )}


      {period === 'year' && (

        <YearChart
          entries={filteredEntries}
          cursorDate={cursorDate}
        />

      )}


      {/* ==================================
          カテゴリ
      ================================== */}

      <div className="dash-row2">

        <div className="dash-card">

          <div className="dash-card-title">

            <i className="ti ti-chart-donut" />

            カテゴリ別割合

          </div>


          {stats.total === 0 ? (

            <div className="dash-empty">

              この期間の日記はありません

            </div>

          ) : (

            <>

              <div className="cat-legend">

                {catList.map(
                  ([cat, count]) => (

                    <span key={cat}>

                      <span
                        className="legend-dot"
                        style={{
                          background:
                            CAT_STYLES[cat]?.dot
                        }}
                      />

                      {cat}

                      {' '}

                      {Math.round(
                        count /
                        stats.total *
                        100
                      )}

                      %

                    </span>

                  )
                )}

              </div>


              <div
                style={{
                  height: 150
                }}
              >

                <Doughnut
                  data={donutData}
                  options={{
                    ...chartOpts,
                    cutout: '65%'
                  }}
                />

              </div>

            </>

          )}

        </div>


        {/* ==================================
            気分
        ================================== */}

        <div className="dash-card">

          <div className="dash-card-title">

            <i className="ti ti-mood-smile" />

            気分の分布

          </div>


          {MOODS.map(mood => {

            const n =
              stats.moodCount[mood] || 0;

            return (

              <div
                key={mood}
                className="mood-row"
              >

                <i
                  className={
                    `ti ${MOOD_ICONS[mood]}`
                  }
                />

                <span className="mood-lbl">

                  {mood}

                </span>

                <div className="mood-bar">

                  <div
                    className="mood-fill"
                    style={{
                      width:
                        `${
                          (
                            n /
                            Math.max(
                              stats.total,
                              1
                            )
                          ) * 100
                        }%`
                    }}
                  />

                </div>

                <span className="mood-n">

                  {n}

                </span>

              </div>

            );

          })}

        </div>

      </div>


      {/* ==================================
          タグ
      ================================== */}

      <div className="dash-card">

        <div className="dash-card-title">

          <i className="ti ti-tags" />

          タグクラウド

        </div>


        {tagsSorted.length === 0 ? (

          <div className="dash-empty">

            この期間にはタグがありません

          </div>

        ) : (

          <div className="tag-cloud">

            {tagsSorted.map(
              ([tag, count]) => {

                const size =
                  Math.round(
                    11 +
                    (
                      count /
                      maxTag
                    ) * 10
                  );

                return (

                  <span
                    key={tag}
                    className="tc-tag"
                    style={{
                      fontSize: size,
                      padding:
                        size > 16
                          ? '5px 11px'
                          : '3px 8px'
                    }}
                  >

                    {tag}

                    {' '}

                    <small>
                      {count}
                    </small>

                  </span>

                );

              }
            )}

          </div>

        )}

      </div>


      {/* ==================================
          辞書換算
      ================================== */}

      <DictionaryCard
        kb={kb}
      />

    </div>

  );

}


/* ========================================
   月間カレンダー
======================================== */

function MonthCalendar({
  entries,
  cursorDate
}) {

  const year =
    cursorDate.getFullYear();

  const month =
    cursorDate.getMonth();


  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();


  const days =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  const cells = [];


  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    cells.push(null);

  }


  for (
    let day = 1;
    day <= days;
    day++
  ) {

    cells.push(day);

  }


  return (

    <div className="dash-card dash-calendar">

      <div className="dash-card-title">

        <i className="ti ti-calendar" />

        {month + 1}月の記録

      </div>


      <div className="mini-cal-dow">

        {[
          '日',
          '月',
          '火',
          '水',
          '木',
          '金',
          '土'
        ].map(day => (

          <div key={day}>
            {day}
          </div>

        ))}

      </div>


      <div className="mini-cal-grid">

        {cells.map(
          (day, index) => {

            if (!day) {

              return (
                <div
                  key={`blank-${index}`}
                  className="mini-cal-cell blank"
                />
              );

            }


            const key =
              dateKey(
                year,
                month,
                day
              );


            const dayEntries =
              entries.filter(
                e =>
                  e.date === key
              );


            const today =
              isSameDay(
                new Date(),
                new Date(
                  year,
                  month,
                  day
                )
              );


            return (

              <div
                key={key}
                className={
                  `mini-cal-cell ${
                    today
                      ? 'today'
                      : ''
                  }`
                }
              >

                <span className="mini-cal-day">

                  {day}

                </span>


                <div className="mini-cal-dots">

                  {dayEntries
                    .slice(0, 4)
                    .map(entry => (

                      <span
                        key={entry.id}
                        style={{
                          background:
                            CAT_STYLES[
                              entry.cat
                            ]?.dot ||
                            '#888'
                        }}
                      />

                    ))}

                </div>

              </div>

            );

          }
        )}

      </div>

    </div>

  );

}


/* ========================================
   週間表示
======================================== */

function WeekCalendar({
  entries,
  cursorDate
}) {

  const start =
    startOfWeek(cursorDate);


  const days =
    Array.from(
      { length: 7 },
      (_, index) => {

        const d =
          new Date(start);

        d.setDate(
          start.getDate() +
          index
        );

        return d;

      }
    );


  return (

    <div className="dash-card">

      <div className="dash-card-title">

        <i className="ti ti-calendar-week" />

        この週の記録

      </div>


      <div className="week-record-grid">

        {days.map(day => {

          const key =
            dateKey(
              day.getFullYear(),
              day.getMonth(),
              day.getDate()
            );


          const count =
            entries.filter(
              e =>
                e.date === key
            ).length;


          return (

            <div
              key={key}
              className="week-record-day"
            >

              <span>

                {
                  [
                    '日',
                    '月',
                    '火',
                    '水',
                    '木',
                    '金',
                    '土'
                  ][day.getDay()]
                }

              </span>


              <strong>

                {day.getDate()}

              </strong>


              {count > 0 && (

                <div className="week-record-count">

                  {count}件

                </div>

              )}

            </div>

          );

        })}

      </div>

    </div>

  );

}


/* ========================================
   年間表示
======================================== */

function YearChart({
  entries,
  cursorDate
}) {

  const year =
    cursorDate.getFullYear();


  const values =
    Array.from(
      { length: 12 },
      (_, month) =>

        entries.filter(entry => {

          const d =
            parseDate(entry.date);

          return (
            d.getFullYear() === year &&
            d.getMonth() === month
          );

        }).length

    );


  const data = {

    labels:
      Array.from(
        { length: 12 },
        (_, i) =>
          `${i + 1}月`
      ),

    datasets: [{

      label: '日記',

      data: values,

      backgroundColor:
        '#1D9E75',

      borderRadius: 4,

      borderSkipped: false

    }]

  };


  return (

    <div className="dash-card">

      <div className="dash-card-title">

        <i className="ti ti-chart-bar" />

        {year}年の記録

      </div>


      <div
        style={{
          height: 200
        }}
      >

        <Bar
          data={data}
          options={{
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
              legend: {
                display: false
              }
            }
          }}
        />

      </div>

    </div>

  );

}