import moment from 'moment';

export default {
  getMonthsOfTheYear: date => {
    const year = moment(date).format('YYYY');
    let months = moment.months();
    return months.map(m => m + ' ' + year);
  },

  getYearBoundary: date => {
    const year = moment(date).format('YYYY');
    const startOfYear = moment(year).startOf('year');
    const endOfYear = moment(year).endOf('year');

    return {
      name: year,
      startDate: startOfYear.toDate(),
      endDate: endOfYear.toDate()
    };
  },

  getMonthsRange: months => {
    let ranges = [];
    months.map(month => {
      const startOfMonth = moment(month, 'MMM YYYY').startOf('month');
      const endOfMonth = moment(month, 'MMM YYYY').endOf('month');

      ranges.push({
        name: moment(startOfMonth).format('MMMM'),
        startDate: startOfMonth.toDate(),
        endDate: endOfMonth
          .clone()
          .add(1, 'd')
          .toDate()
      });
    });

    return ranges;
  },

  getDaysRange: (startDate, endDate) => {
    let ranges = [];
    const diff = moment(endDate).diff(startDate, 'day');
    const s = moment(startDate);
    const e = moment(endDate);

    let day = s.clone();

    while (day <= e) {
      ranges.push({
        name: day.format('D MMM'),
        startDate: day.clone().format('MM/DD/YYYY'),
        endDate: day
          .clone()
          .add(1, 'd')
          .format('MM/DD/YYYY')
      });
      day = day.clone().add(1, 'd');
    }

    return ranges;
  },

  getWeeksRange: (startDate, endDate) => {
    const diff = moment(endDate).diff(startDate, 'week');
    let ranges = [];

    const start = moment(startDate);
    const end = moment(endDate);
    ranges.push({
      name: 'Week 1',
      startDate: start
        .clone()
        .startOf('week')
        .format('MM/DD/YYYY'),
      endDate: start
        .clone()
        .endOf('week')
        .format('MM/DD/YYYY')
    });

    let count = 1;
    let day = start.clone();
    while (day < end) {
      const startOfWeek = start
        .clone()
        .add(count, 'w')
        .startOf('week');
      const endOfWeek = start
        .clone()
        .add(count, 'w')
        .endOf('week');

      day = endOfWeek.clone();

      count++;
      ranges.push({
        name: `Week ${count}`,
        startDate: startOfWeek.format('MM/DD/YYYY'),
        endDate: endOfWeek.format('MM/DD/YYYY')
      });
    }

    return ranges;
  },

  getQuarterMonths: date => {
    const startQuarter = moment(date)
      .startOf('quarter')
      .format('MMM YYYY');

    const middleQuarter = moment(startQuarter)
      .add('month', 1)
      .format('MMM YYYY');

    const endQuarter = moment(date)
      .endOf('quarter')
      .format('MMM YYYY');

    return [startQuarter, middleQuarter, endQuarter];
  },

  getQuarterHeaderRanges: (months, quarter) => {
    return {
      startDate: moment(months[0], 'MMMM YYYY')
        .startOf('month')
        .toDate(),
      endDate: moment(months[months.length - 1], 'MMMM YYYY')
        .endOf('month')
        .toDate(),
      name: quarter
    };
  },

  getQuarter: date => {
    const m = moment(date).format('M');
    const year = moment(date).format('YYYY');
    if (m <= 3) {
      return `Q1 ${year}`;
    } else if (m >= 4 && m <= 6) {
      return `Q2 ${year}`;
    } else if (m >= 7 && m <= 9) {
      return `Q3 ${year}`;
    } else {
      return `Q4 ${year}`;
    }
  },

  getOverallYears: date => {
    const currentYear = moment(date);
    const previousYear = currentYear.clone().subtract(1, 'y');
    const nextYear = currentYear.clone().add(1, 'y');

    return [
      previousYear.format('YYYY'),
      currentYear.format('YYYY'),
      nextYear.format('YYYY')
    ];
  },

  getOverallYearBoundaries: years => {
    let ranges = [];

    years.map(y => {
      ranges.push({
        name: y,
        startDate: moment(y, 'MMMM YYYY')
          .startOf('year')
          .toDate(),
        endDate: moment(y, 'MMMM YYYY')
          .endOf('year')
          .toDate()
      });
    });
    return ranges;
  },

  getOverallBoundaries: years => {
    return {
      startDate: moment(years[0])
        .startOf('year')
        .toDate(),
      endDate: moment(years[years.length - 1])
        .endOf('year')
        .toDate(),
      name: 'Overall (prev, current, next)'
    };
  },

  getMontlyBoundaries: (startDate, endDate) => {
    return {
      startDate: moment(startDate).toDate(),
      endDate: moment(endDate).toDate()
    };
  }
};
