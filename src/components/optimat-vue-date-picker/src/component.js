import { BaseModule } from './lib/BaseModule';
import dateformat from 'dateformat';
import defaultInfoConfig from './defaultInfoConfig';
import icons from './icons.json';

const defaultDayOfWeek = defaultInfoConfig.defaultDayOfWeek;
const defaultMaxDayOfWeek = defaultInfoConfig.defaultMaxDayOfWeek;
const defaultMaxRows = defaultInfoConfig.defaultMaxRows;
const defaultMaxDaysOfRows = defaultInfoConfig.defaultMaxDaysOfRows;
const monthObjectKey = defaultInfoConfig.monthObjectKey;

class Component extends BaseModule {
  constructor () {
    super();
    this.setProps(['options']);
    this.setComponent({});
    this.setMethod({
      setOptions () {
        let options = this.options || {};
        this.autoDismiss = typeof options.autoDismiss === 'boolean' ? options.autoDismiss : false;
        this.onStartDateChanged = typeof options.onStartDateChanged === 'function' ? options.onStartDateChanged : null;
        this.onEndDateChanged = typeof options.onEndDateChanged === 'function' ? options.onEndDateChanged : null;
        this.onDismiss = typeof options.onDismiss === 'function' ? options.onDismiss : null;
        this.onShow = typeof options.onShow === 'function' ? options.onShow : null;
        this.preDismiss = typeof options.preDismiss === 'function' ? options.preDismiss : null;
        this.preShow = typeof options.preShow === 'function' ? options.preShow : null;
        this.placeholder = options.placeholder || '';
        this.isShowDatePickLayout = typeof options.isShow === 'boolean' ? options.isShow : false;
        this.align = options.align || 'center';
        this.type = options.type || 'single';
        this.mode = options.mode || (this.isSingleType ? 'single' : (this.isRangeType ? 'double' : 'single'));
        this.autoClear = typeof options.autoClear === 'boolean' ? options.autoClear : false;
        this.defaultStartDate = options.defaultStartDate instanceof Date ? options.defaultStartDate : new Date();
        this.currentLeftMonth = this.defaultStartDate;
        this.selectPassDate = typeof options.selectPassDate === 'boolean' ? options.selectPassDate : false;
        if ((typeof options.reset === 'boolean' ? options.reset : false)) {
          this.startDate = 0;
          this.endDate = 0;
        }
      },
      showDatePickLayout () {
        typeof this.preShow === 'function' && this.preShow();
        this.isShowDatePickLayout = true;
        typeof this.onShow === 'function' && this.onShow();
      },
      hideDatePickLayout () {
        let startDate = this.startDate;
        let endDate = this.endDate;
        startDate = startDate ? this.parseDate(new Date(startDate)) : null;
        endDate = endDate ? this.parseDate(new Date(endDate)) : null;
        typeof this.preDismiss === 'function' && this.preDismiss(startDate, endDate);
        this.$el.querySelector('.date-input').blur();
        this.isShowDatePickLayout = false;
        this.$nextTick(() => {
          typeof this.onDismiss === 'function' && this.onDismiss(startDate, endDate);
        });
      },
      // toggleDatePickLayout () {
      //     if (this.isShowDatePickLayout) {
      //         this.hideDatePickLayout();
      //     } else {
      //         this.showDatePickLayout();
      //     }
      // },
      parseDate (date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let dayOfMonth = date.getDate();
        let dayOfWeek = date.getDay();
        return [year, month, dayOfMonth, dayOfWeek, date];
      },
      // 计算左边日历信息
      computeLeftMonthDateInfo () {
        let date = this.parseDate(this.getCurrentDate());
        this.computeMonthDateInfo(date, monthObjectKey.leftMonthDateInfo);
      },
      // 计算右边日历信息
      computeRightMonthDateInfo () {
        let date = this.getCurrentDate();
        date.setMonth(date.getMonth() + 1);
        date = this.parseDate(date);
        this.computeMonthDateInfo(date, monthObjectKey.rightMonthDateInfo);
      },
      // 计算日历信息
      computeMonthDateInfo (date, key) {
        let month = date[1];
        let maxDayOfMonth = this.computeMaxDayOfMonth(date[0], month);
        // 默认每个月都显示6行日期（可能存在上月或下月的日期）
        let lastMonthDays = this.computeLastMonthDays(date);// 计算可显示的上月日期
        let nextMonthDays = this.computeNextMonthDays(maxDayOfMonth, lastMonthDays.length);// 计算可显示的下月日期
        let dayOfMonth = date[2];
        let isCurrentMonth = this.isCurrentMonth(date[4]);
        let mergeList = [];
        let srcList = [].concat(lastMonthDays).concat((() => {
          let list = [];
          for (let day = 1; day <= maxDayOfMonth; day++) {
            list.push(day);
          }
          return list;
        })()).concat(nextMonthDays);
        let tempList = null;
        let defaultMaxDaysOfRows = this.defaultMaxDaysOfRows;
        let lastMonthDaysLength = lastMonthDays.length;
        let validDayStart = lastMonthDaysLength + dayOfMonth - 1;
        let previewDayStart = lastMonthDaysLength + maxDayOfMonth;
        srcList.forEach((day, index) => {
          if (!tempList) {
            tempList = [];
          }
          let invalid = isCurrentMonth && index < validDayStart; // 是否为无效日期
          let preview = index >= previewDayStart || (!isCurrentMonth && index < lastMonthDaysLength); // 是否为预览日期
          if (this.selectPassDate) { // 能选择以往日期
            preview = preview || index < lastMonthDays.length;
            invalid = false;
          }
          let realDate = new Date();
          realDate.setFullYear(date[0]);
          if (index < lastMonthDaysLength) { // 上月
            realDate.setMonth(month - 2);
          } else if (index >= previewDayStart) {
            realDate.setMonth(month);
          } else {
            realDate.setMonth(month - 1);
          }
          realDate.setDate(day);
          let time = realDate.getTime();
          tempList.push({
            day,
            index,
            time,
            invalid,
            preview
          });
          if (tempList.length >= defaultMaxDaysOfRows) {
            mergeList.push(tempList);
            tempList = null;
          }
        });
        if (tempList) {
          mergeList.push(tempList);
        }
        let object = {
          maxDayOfMonth, lastMonthDays, nextMonthDays, mergeList, date
        };
        if (isCurrentMonth) {
          let dayOfWeek = date[3];
          object.dayOfMonthRowIndex = this.computeDayOfMonthRowIndex(dayOfMonth, dayOfWeek, lastMonthDays.length, nextMonthDays.length);
        }
        this[key] = object;
      },
      // 计算某天在日历中的位置
      computeDayOfMonthRowIndex (dayOfMonth, dayOfWeek, lastMonthDaysLength) {
        let x = dayOfWeek % 7;
        let y = parseInt((dayOfMonth + lastMonthDaysLength) / this.defaultMaxDaysOfRows);
        return { x, y };
      },
      // 计算某个月的最大日期
      computeMaxDayOfMonth (year, month) {
        if (month === 2 && this.isLeapYear(year)) {
          return 29;
        } else {
          return this.defaultMaxDayOfWeek[month];
        }
      },
      // 是否为闰年
      isLeapYear (year) {
        return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
      },
      // 计算可显示的上月日期
      computeLastMonthDays (date) {
        const _date = new Date(date[4].getTime());
        _date.setDate(1);
        let dayOfWeek = _date.getDay();
        let loss = 0;
        let lastMonth = date[1] - 1 || (() => {
          loss = -1;
          return 12;
        })();
        let maxDayOfLastMonth = this.computeMaxDayOfMonth(date[0] + loss, lastMonth);
        let days = dayOfWeek % 7;
        let lastMonthDayList = [];
        for (let day = 0; day < days; day++) {
          lastMonthDayList.push(maxDayOfLastMonth - day);
        }
        return lastMonthDayList.reverse();
      },
      // 计算可显示的下月日期
      computeNextMonthDays (maxDayOfMonth, lastMonthDaysLength) {
        let days = this.defaultMaxRows * this.defaultMaxDaysOfRows - maxDayOfMonth - lastMonthDaysLength;
        let nextMonthDayList = [];
        for (let day = 1; day <= days; day++) {
          nextMonthDayList.push(day);
        }
        return nextMonthDayList;
      },
      format (date, formatStr) {
        return dateformat(date, formatStr);
      },
      recompute () {
        this.computeLeftMonthDateInfo();
        this.computeRightMonthDateInfo();
        this.pickerMinWidth = this.mode === 'single' ? 'auto' : (window.remScale * 60 + 25 * 7 * 2);
      },
      lastMonth () {
        if (this.canShowLastMonth(this.currentLeftMonth)) {
          this.setDate(-1);
        }
      },
      nextMonth () {
        this.setDate(1);
      },
      isCurrentMonth (date) {
        let currentDate = this.defaultStartDate || new Date();
        return date.getFullYear() === currentDate.getFullYear() && date.getMonth() === currentDate.getMonth();
      },
      isCurrentDate (lDate, rDate) {
        return lDate.getFullYear() === rDate.getFullYear() && lDate.getMonth() === rDate.getMonth() && lDate.getDate() === rDate.getDate();
      },
      setDate (offset) {
        let currentLeftMonth = new Date(this.currentLeftMonth.getTime());
        let month = currentLeftMonth.getMonth() + offset;
        currentLeftMonth.setMonth(month);
        this.currentLeftMonth = new Date(currentLeftMonth.getTime());
      },
      getCurrentDate () {
        return new Date(this.currentLeftMonth.getTime());
      },
      focusInput (e) {
        if (e.target.id !== 'input') {
          e.preventDefault();
        }
      },
      select (day) {
        if (!day.invalid) { // 如果是有效日期
          let time = day.time;
          if (this.isSingleType) {
            this.startDate = time;
            this.tryToDismiss();
          } else if (this.isRangeType) {
            let startDate = this.startDate;
            let endDate = this.endDate;
            if (this.autoClear && endDate) {
              this.clearDate();
              startDate = 0;
            }
            if (startDate) {
              if (this.isStartDate(day)) {
                this.clearDate();
              } else if (this.isEndDate(day)) {
                this.endDate = 0;
              } else {
                this.startDate = Math.min(time, startDate);
                if (endDate) {
                  this.startDate = Math.min(endDate, this.startDate);
                }
                this.endDate = Math.max(time, startDate);
                this.tryToDismiss();
              }
            } else {
              this.startDate = time;
            }
          }
        }
      },
      isDefaultStartDate (day) {
        let realDate = new Date(day.time);
        let startDate = this.defaultStartDate || new Date();
        return this.isCurrentDate(realDate, startDate) ? 'default-start-date-item' : '';
      },
      isStartDate (day) {
        let realDate = new Date(day.time);
        let startDate = new Date(this.startDate);
        return this.isCurrentDate(realDate, startDate) ? 'start-date-item' : '';
      },
      isEndDate (day) {
        let realDate = new Date(day.time);
        let endDate = new Date(this.endDate);
        return this.isCurrentDate(realDate, endDate) ? 'end-date-item' : '';
      },
      isMiddleDate (day) {
        let time = day.time;
        let startDate = this.startDate;
        let endDate = this.endDate;
        return (!(this.isStartDate(day) || this.isEndDate(day)) && (endDate > time && startDate < time)) ? 'middle-date-item' : '';
      },
      clearDate () {
        this.startDate = 0;
        this.endDate = 0;
      },
      computePickerLeft () {
        let align = this.align;
        let left = 0;
        if (this.$el) {
          let targetEl = this.$el.querySelector('.date-input-layout');
          let pickerEl = this.$el.querySelector('.date-pick-layout');
          let offset = targetEl.offsetWidth - pickerEl.offsetWidth;
          switch (align) {
            case 'left':
              left = 0;
              break;
            case 'right':
              left = offset;
              break;
            case 'center':
              left = offset * 0.5;
              break;
          }
        }
        this.pickerLeft = left;
      },
      tryToDismiss () {
        if (this.autoDismiss) {
          this.hideDatePickLayout();
        }
      },
      canShowLastMonth (date) {
        return this.selectPassDate || !this.isCurrentMonth(date);
      }
    });
    this.setCompute({
      mergeDate () {
        let startDate = this.startDate;
        let endDate = this.endDate;
        let startDateStr = '';
        let endDateStr = '';
        if (startDate) {
          startDateStr = dateformat(new Date(startDate), 'yyyy-mm-dd');
        }
        if (endDate) {
          endDateStr = dateformat(new Date(endDate), 'yyyy-mm-dd');
        }
        if (endDateStr) {
          return `${startDateStr} - ${endDateStr}`;
        } else if (startDateStr && this.isSingleType) {
          return startDateStr;
        }
        return '';
      },
      isSingleType () {
        return this.type === 'single';
      },
      isRangeType () {
        return this.type === 'range';
      },
      isSingleMode () {
        return this.mode === 'single';
      },
      isDoubleMode () {
        return this.mode === 'double';
      }
    });
    this.setWatch({
      isShowDatePickLayout (value) {
        if (value) {
          typeof this.preShow === 'function' && this.preShow();
          this.recompute();
          this.$nextTick(() => {
            this.computePickerLeft();
            typeof this.onShow === 'function' && this.onShow();
          });
        } else {
          this.hideDatePickLayout();
        }
      },
      currentLeftMonth () {
        this.recompute();
      },
      options () {
        this.setOptions();
      },
      startDate (value) {
        typeof this.onStartDateChanged === 'function' && this.onStartDateChanged(value ? this.parseDate(new Date(value)) : null, value ? 'Selected' : 'InvertSelected');
      },
      endDate (value) {
        typeof this.onEndDateChanged === 'function' && this.onEndDateChanged(value ? this.parseDate(new Date(value)) : null, value ? 'Selected' : 'InvertSelected');
      }
    });
  }

  getData () {
    return {
      autoDismiss: false,
      isShowDatePickLayout: false,
      currentLeftMonth: null,
      icons,
      monthObjectKey,
      defaultMaxRows,
      defaultMaxDaysOfRows,
      defaultDayOfWeek,
      leftDateList: [],
      defaultMaxDayOfWeek,
      leftMonthDateInfo: {},
      rightMonthDateInfo: {},
      startDate: 0,
      endDate: 0,
      fakeEndDate: 0,
      pickerLeft: 'auto',
      pickerMinWidth: 'auto'
    };
  }

  onCreate () {
    this.app.setOptions();
  }

  onMount () {
  }
}

module.exports = Component;
