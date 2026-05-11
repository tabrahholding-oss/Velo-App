import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import moment from 'moment';
import Dates from './Dates';

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

export default class Calendar2 extends PureComponent {
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
    };
   
    
  }

  // Get an array of dates for showing in a horizontal scroll view
  getDates = (): Array<Moment> => {
    const {currentDate, showDaysBeforeCurrent, showDaysAfterCurrent, stday} =
      this.props;

    // Go `showDaysBeforeCurrent` ago before today or custom `currentDate`
    const startDay = moment(currentDate || undefined).subtract(
      showDaysBeforeCurrent + 1,
      'days',
    );
    // Number of days in total
    const totalDaysCount = showDaysBeforeCurrent + showDaysAfterCurrent + 1;

    // And return an array of `totalDaysCount` dates
    return [...Array(totalDaysCount)].map(_ => startDay.add(1, 'day').clone());
  };

  onSelectDay = (index: number) => {
    this.setState({globalIndex: index});

    const {dates} = this.state;
    const {onSelectDate} = this.props;
    //this.setState({ currentDateIndex: index });
    onSelectDate(dates[index], index);
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
    console.log(this.props,'pr')
    this.setState({globalIndex:this.props.globalIndex})
    this.state.lastmonth = moment(
      this.state.dates[this.state.dates.length - 1],
    ).format('MMMM');

    if (this.state.currentMonth != this.state.lastmonth) {
      this.state.NewNextMonth = ' - ' + this.state.lastmonth;
    }
    const {dates, currentDateIndex,globalIndex, currentMonth, lastmonth, NewNextMonth} =
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
            currentDateIndex={globalIndex}
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
