// tutorial
// https://codepen.io/mcolynuck/pen/gxJerq
// https://jsfiddle.net/jallison/2d5rhmo1/17/
// http://layer0.authentise.com/gantt-chart-with-reactjs-and-d3js.html
// https://jsfiddle.net/matehu/w7h81xz2/
// https://jsfiddle.net/matehu/w7h81xz2/
// https://bl.ocks.org/varun-raj/5d2caa6a9ad7de08bd5d86698e3a2403
// http://bl.ocks.org/oluckyman/6199145

import { gantt } from './gantt';
import data from './data';
import bigData from './bigData';
import '../styles/index.scss';

const conf = {
  data: data,
  container: '#chart',
  box_padding: 10,
  metrics: {
    type: 'overall', // [overall, yearly, quarterly-[months,weeks], monthly-[months,weeks]]
    startDate: '2018-08-01 10:11:12.123456',
    endDate: null,
    subType: 'months'
  },
  showChildColor: false,
  headerAdd: () => {
    alert('Yeyy!!!');
  }
};
gantt(conf);
