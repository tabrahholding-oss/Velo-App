import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import moment from 'moment-timezone';
import Dates from './Dates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClassContoller } from '../../controllers/ClassController';
moment.tz.setDefault('Asia/Qatar');

type Props = {
  // Optional prop to pass a custom date to use instead of today
  currentDate?: string | Moment,
  // Callback executed when user taps on a date
  onSelectDate: (date: Moment, index: number) => any,
  // Number of days to show before today or custom current date
  showDaysAfterCurrent?: number,
  // Number of days to show after
  showDaysBeforeCurrent?: number,
  globalIndex?: number,
  
};

type State = {
  // True when all dates have rendered
  allDatesHaveRendered: boolean,
  // Currently chosen date index
  currentDateIndex: ?number,
  // Store months and years of the dates visible on the screen
  // for rendering month(s) and year(s) above the dates
  visibleMonths: ?Array<string>,
  visibleYears: ?Array<string>,
  // Array of dates to show
  dates: Array<Moment>,
  // Store each day with to help with scrolling to specific days
  // and calculating which days are visible on the screen
  dayWidths: ?{|[index: number]: number|},
  // Store current scroll position
  scrollPositionX: number,
};

export default class Calendar extends PureComponent {
  props: Props;

  state: State;

  static defaultProps = {
    // Show 5 days before the current day
    showDaysBeforeCurrent: 0,
    // And after
    showDaysAfterCurrent: 15,
  };

  _scrollView;

  // Initialize the state with default values
  constructor(props: Props) {
    super(props);
    this.state = {
      allDatesHaveRendered: false,
      currentDateIndex: props.showDaysBeforeCurrent,
      dates: this.getDates(),
      dayWidths: undefined,
      scrollPositionX: 0,
      visibleMonths: undefined,
      visibleYears: undefined,
      curentDate: moment(new Date()).format('DD'),
      currentMonth: moment(new Date()).format('MMMM'),
      lastmonth: '',
      NewNextMonth: '',
      stday: moment(new Date()).format('DD'),
      globalIndex: props.globalIndex,
      allDatesNew: this.getAllDates(),
    };

    // AsyncStorage.getItem('di', (err, result) => {
    //   if (result) {
    //     this.setState({globalIndex: parseInt(result)});
    //   }
    // });
  }

  // Get an array of dates for showing in a horizontal scroll view

  getAllDates = async() => {
    const instance = new ClassContoller();
    const res = await instance.get15Dates();
    let data = [];
    res.map(i=> {
      data.push(moment(i).format());
    })
    console.log(data,moment(),'res')
    return data;
  }

  getDates = (): Array<Moment> => {
    const {currentDate, showDaysBeforeCurrent, showDaysAfterCurrent, stday} =
      this.props;

    // Go `showDaysBeforeCurrent` ago before today or custom `currentDate`
    // const startDay = moment(currentDate || undefined).subtract(
    //   showDaysBeforeCurrent + 1,
    //   'days',
    // );
    const startDay = moment(currentDate || undefined).subtract(
      showDaysBeforeCurrent + 1,
      'days',
    );
    // Number of days in total
    const totalDaysCount = showDaysBeforeCurrent + showDaysAfterCurrent + 1;

    // And return an array of `totalDaysCount` dates

    let alldates = [...Array(totalDaysCount)].map(_ =>
      startDay.add(1, 'day').clone(),
    );

    console.log(alldates,'allldates')

    let todayIndex = this.getTodayIndex(alldates);
    let alldatesfilter = [];
    if (todayIndex > 0) {
      alldatesfilter = alldates.filter(
        i =>
          moment(i).isAfter(moment(alldates[todayIndex], 'day')) ||
          moment(i).isSame(moment(alldates[todayIndex], 'day')),
      );
    } else {
      alldatesfilter = alldates;
    }
    
    console.log(todayIndex, alldatesfilter, 'alldatesfilter');
    return alldatesfilter;
  };

  onSelectDay = (index: number, dt) => {
    console.log(index,dt,'ddd')
   
    const {dates} = this.state;

    let customIndex = 0;
    dates.map((i,indexnew) => {
      if(i === dt){
        customIndex = indexnew;
      }
    })
    this.setState({globalIndex: customIndex});
    
    const {onSelectDate} = this.props;
    console.log(dates[index],dt,customIndex,'dttt')
    onSelectDate(dt, customIndex)

    // this.setState({globalIndex: index});
    // const {dates} = this.state;
    // const {onSelectDate} = this.props;
    // //this.setState({ currentDateIndex: index });
    // onSelectDate(dates[index], index);
  };

  getTodayIndex = alldates => {
    let todayIndex = 0;
    alldates.forEach((i, index) => {
      if (moment(i).isSame(moment(), 'day') === true) {
        todayIndex = index;
      }
    });
    console.log(todayIndex, 'todayIndextodayIndex');
    return todayIndex;
  };

  onSelectDay1 = () => {
    const {dates} = this.state;
    const {onSelectDate} = this.props;
    this.setState({currentDateIndex: 0});
    onSelectDate(dates[0]);
    this._scrollView.scrollTo({y: 0});
  };

  onRenderDay = (index: number, width: number) => {
    const {dayWidths} = this.state;
    const {showDaysBeforeCurrent, showDaysAfterCurrent} = this.props;

    // Check whether all date have been rendered already
    const allDatesHaveRendered =
      dayWidths &&
      Object.keys(dayWidths).length >=
        showDaysBeforeCurrent + showDaysAfterCurrent;

    this.setState(prevState => ({
      allDatesHaveRendered,
      dayWidths: {
        // keep all existing widths added previously
        ...prevState.dayWidths,
        // keep the index for calculating scrolling position for each day
        [index]: width,
      },
    }));
  };

  render() {
    this.state.lastmonth = moment(
      this.state.dates[this.state.dates.length - 1],
    ).format('MMMM');

    if (this.state.currentMonth != this.state.lastmonth) {
      this.state.NewNextMonth = ' - ' + this.state.lastmonth;
    }
    const {dates, currentDateIndex, currentMonth, lastmonth, NewNextMonth} =
      this.state;

    return (
      <View>
        <Text style={styles.visibleMonthAndYear}>
          {currentMonth}
          {NewNextMonth}
        </Text>

        <ScrollView
          ref={scrollView => {
            this._scrollView = scrollView;
          }}
          horizontal={true} // Enable horizontal scrolling
          showsHorizontalScrollIndicator={false} // Hide horizontal scroll indicators
          automaticallyAdjustContentInsets={false} // Do not adjust content automatically
        >
          <Dates
            dates={dates}
            currentDateIndex={this.state.globalIndex}
            onSelectDay={this.onSelectDay}
            onRenderDay={this.onRenderDay}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  visibleMonthAndYear: {
    color: 'rgba(0, 0, 0, 0.8)',
    paddingTop: 10,
    textAlign: 'left',
    textTransform: 'uppercase',
    fontSize: 10,
  },
});
