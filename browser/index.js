
import React from 'react';
import ReactDOM from 'react-dom';

let api_url = "http://localhost:4000/graphql"

function Container (props) {
	return (
				<div className="container">
					{props.children}
				</div>
			);
}

class Clock extends React.Component {

	constructor(props)
	{
	    super(props);
	    this.state = {date: new Date()};
	}

	updateClock()
	{
		this.setState({
			date: new Date()
		});
	}

	getTime()
	{
		const date = this.state.date;
		function convertToTwoDigit(val)
		{
			if (val < 10) return "0" + val;
			return "" + val;
		}
	    const h = convertToTwoDigit(date.getHours());
	    const m = convertToTwoDigit(date.getMinutes());
	    const s = convertToTwoDigit(date.getSeconds());
	    return h + ":" + m + ":" + s;
	}

	getDate()
	{
		const date = this.state.date;
		return date.toLocaleDateString();;
	}

	componentDidMount() {
		this.timerID = setInterval(
		  () => this.updateClock(),
		  1000
		);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	render() {
		return (
			<div>
			<Container>
				<div className="clock-display">
					{this.getTime()}
				</div>
			</Container>
			<Container>
				{this.getDate()}
			</Container>
			</div>
		)
	}
}

class Weather extends React.Component {

	constructor(props)
	{
	    super(props);
	}

	componentDidMount() {
		this.timerID = setInterval(
		  () => __weatherwidget_init(),
		  3600000
		);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	render() {
		return (
			<div className="container">
				<a className="weatherwidget-io" href="https://forecast7.com/en/51d1117d04/wroclaw/" data-label_1="WROCŁAW" data-label_2="WEATHER" data-font="Roboto" data-icons="Climacons Animated" data-basecolor="rgba(250, 250, 250, 1.0)" data-days="3" data-theme="pure" >WROCŁAW WEATHER</a>
			</div>
		);
	}
}

function Background(props)
{
	return (
			<div id="background">{props.children}</div>
		)
}

function Notification(props)
{
	return (
		<div className="container">
			<div className="title">
				{props.title}
			</div>
			<div className="description" dangerouslySetInnerHTML={{ __html: props.description}}/>
		</div>
	);
}

class Notifs extends React.Component
{
	constructor(props)
	{
		super(props)
		this.state = { notifs: [] };
	}

	componentDidMount() {
		this.checkNotifs();
		this.timerID = setInterval(
		  () => this.checkNotifs(),
		  30000
		);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	checkNotifs()
	{
		const xhr = new XMLHttpRequest();
		xhr.open('GET', api_url + "?query={allValidNotifs{id title subtitle data source}}", true);
		xhr.send();
		xhr.addEventListener("readystatechange", updateNotifs, false);
		const component = this;
		function updateNotifs()
		{
		    if (xhr.readyState == 4 && xhr.status == 200) {
				const response = JSON.parse(xhr.responseText);
				component.setState({ notifs: response.data.allValidNotifs });
		    }
		}
	}

	render()
	{
		let result = []
		for (let notif of this.state.notifs)
		{
			if (notif.source != "google cal")
			{
				result.push(
					<Notification key={notif.id} title={notif.title} description={notif.subtitle} />)
			}
		}
          return <div> {result} </div>
	}
}

function Event(props)
{
	return (
		<div className="calendar_container">
			<div className="calendar_title">
				{ props.title }
			</div>
			<i className="fas fa-map-marker"></i> { props.location } <br/>
			<i className="far fa-clock"> </i> {props.startTime} - { props.endTime } <br/>
			<i className="far fa-calendar"></i> { props.startDate }
		</div>
		)
}

class Calendar extends React.Component {

       constructor(props)
       {
               super(props)
               this.state = { events: [] };
       }

       componentDidMount() {
               this.checkNotifs();
               this.timerID = setInterval(
                 () => this.checkNotifs(),
                 30000);
       }
       componentWillUnmount() {
               clearInterval(this.timerID);
       }

       checkNotifs()
       {
               const xhr = new XMLHttpRequest();
               xhr.open('GET', api_url + "?query={allValidNotifs{id title subtitle data source}}", true);
               xhr.send();
               xhr.addEventListener("readystatechange", updateNotifs, false);
               const component = this;
               function updateNotifs()
               {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                               const response = JSON.parse(xhr.responseText);
                              let notifs = response.data.allValidNotifs;

               notifs = notifs.filter((notif) => {
                       return notif.source == "google cal";
               });
               notifs.sort((lhs, rhs) => {
                       const ldata = JSON.parse(lhs.data).data;
                       const rdata = JSON.parse(rhs.data).data;
                       return new Date(ldata.startDateTime) > new Date(rdata.startDateTime);
               })
               let events = []
               for (let notif of notifs)
               {
                       if (notif.source == "google cal")
                       {
                               const data = JSON.parse(notif.data).data;
                               const startDate = new Date(Date.parse(data.startDateTime));
                               const endDate = new Date(Date.parse(data.endDateTime));
                               const title = notif.title;
                               events.push({title: title, startDateTime: startDate, endDateTime: endDate});
                       }
               }
                               component.setState({ events: events });
                  }
               }
       }
render() {
    const timeRange = { startHour: 6, endHour: 24 };
    const numberOfRows = (timeRange.endHour - timeRange.startHour) * 4;
    const divFrame = {
      gridTemplateColumns: "100px 1fr"
    }
    let events = this.state.events;
//    [
//      {
//        title: "Analiza numeryczna (M) - repetytorium",
//        startDateTime: new Date("2018-10-20T14:15:00+02:00"),
//        endDateTime: new Date("2018-10-20T16:00:00+02:00"),
//      }
//    ]
    let cal_events = []
    for (let i = 0; i < events.length; i++)
    {
      const now = new Date()
      const todayMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      0,0,0);
      const e = events[i];
      const title = e.title;
      const startDateTime = e.startDateTime;
      const endDateTime = e.endDateTime;
      const startMinute = (startDateTime - todayMidnight) / (1000 * 60);
      let startRow = (startMinute - (timeRange.startHour * 60)) / 15;
      const endMinute = (endDateTime - todayMidnight) / (1000 * 60);
      let endRow = (endMinute - (timeRange.startHour * 60)) / 15;
      if ((endRow <= 0 && startRow <= 0) || (endRow >= numberOfRows && startRow >= numberOfRows))
        continue;

      if (endRow > numberOfRows)
        endRow = numberOfRows;

      if (startRow < 0)
        startRow = 0;

      const eventStyle = {
        gridRowStart: startRow + 1,
        gridRowEnd: endRow + 1,
      }
      
      cal_events.push(<div style={eventStyle} className="cal_event"> {title} </div>);  
    }

    let cal_labels = []
    for (let i = timeRange.startHour; i < timeRange.endHour; i++)
    {
      let text = i + ":00";
      cal_labels.push(<div className="cal_label"> {text} </div>);
    }
    return (
			<div style={divFrame} className="container cal_frame">
        {cal_labels}
			  {cal_events}
      </div>	
		);
	}
}

function Layout(props)
{
	return (
		<Background>
			<div id="grid-layout">
				<div id="notifs" className="area">
					<Notifs/>
				</div>
				<div id="clock" className="area">
					<Clock/>
					<Calendar/>
				</div>
				<div id="calendar" className="area">
					<Weather/>
				</div>
			</div>
		</Background>
		)
}

window.onload = function(){
  ReactDOM.render((<Layout/>), document.getElementById('app'));
}


