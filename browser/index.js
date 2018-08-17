
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

function Notification(props)
{
	return (
		<div className="container">
			<div className="title">
				{props.title}
			</div>
			<div className="description">
				{props.description}
			</div>
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
		  10000
		);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	checkNotifs()
	{
		console.log("Checking notifs");
		const xhr = new XMLHttpRequest();
		xhr.open('GET', api_url + "?query={allValidNotifs{id title subtitle}}", true);
		xhr.send();
		xhr.addEventListener("readystatechange", updateNotifs, false);
		const component = this;
		function updateNotifs()
		{
			console.log("XDD");
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
			result.push(
				<Notification key={notif.id} title={notif.title} description={notif.subtitle} />)
		}
		return <div> {result} </div>
	}
}

function Event(props)
{
	return (
		<div className="container">
			<div className="title">
				{ props.title }
			</div>
			<i className="fas fa-map-marker"></i> { props.location } <br/>
			<i className="far fa-clock"> </i> {props.startTime} - { props.endTime } <br/>
			<i className="far fa-calendar"></i> { props.startDate }
		</div>
		)
}

class Calendar extends React.Component
{
	constructor(props)
	{
		super(props)
		this.state = { events: [] };
	}

	componentDidMount() {
		this.checkEvents();
		this.timerID = setInterval(
		  () => this.checkEvents(),
		  10000
		);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	checkEvents()
	{
		console.log("Checking notifs");
		const now = new Date()
		const isoDate = now.toISOString();
		const query = '{eventsFrom(from : "' + isoDate + '", limit: 10){id name location startTime endTime }}'
		const xhr = new XMLHttpRequest();
		xhr.open('GET', api_url + "?query=" + query, true);
		xhr.send();
		xhr.addEventListener("readystatechange", updateEvents, false);
		const component = this;
		function updateEvents()
		{
			console.log("XDDD")
		    if (xhr.readyState == 4 && xhr.status == 200) {
				const response = JSON.parse(xhr.responseText);
				component.setState({ events: response.data.eventsFrom });
		    }
		}
	}

	render()
	{
		let result = []
		for (let event of this.state.events)
		{
			const startDate = new Date(Date.parse(event.startTime));
			const endDate = new Date(Date.parse(event.endTime));
			// console.log(startDate);
			const sTime = startDate.toLocaleTimeString();
			const eTime = endDate.toLocaleTimeString();
			const date = startDate.toDateString();
			result.push(<Event key={event.id} title={event.name} startDate={date} startTime={sTime} endTime={eTime} location={event.location}/>)
		}
		return <div> {result} </div>
	}
}

function Layout(props)
{
	return (
		<div id="grid-layout">
			<div id="notifs" className="area">
				<Notifs/>
			</div>
			<div id="clock" className="area">
				<Clock/>
			</div>
			<div id="calendar" className="area">
				<Calendar/>
			</div>
		</div>
		)
}

window.onload = function(){
  ReactDOM.render((<Layout/>), document.getElementById('app'));
}


