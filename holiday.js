let api_key = "";

fetch("config.json")
  .then((response) => response.json())
  .then((config) => {
    api_key = config.API_KEY;
  });
console.log(api_key);

let top_month = new Date().getMonth();
let top_year = new Date().getFullYear();

let country = "BA";
let isCalled = '';


function markHolidays(data) {
    let squares = document.querySelectorAll('td');
    for (let square of squares) {
        for (let information of data) {
            if (information.date.datetime.day == square.innerText) {
                square.innerHTML += `<div class="note">${information.name}</div>`;
                
            } 
        }
    }
}

async function fetchPromise(api_key,year,country,month) {
    try{
        const response = await fetch(`https://calendarific.com/api/v2/holidays?&api_key=${api_key}&country=${country}&year=${year}&month=${month}`,
            {
                method: "GET",
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
           }
        );
        if (!response.ok) {
            throw new Error(`HTTP status is: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.response.holidays);
        if (isCalled) {
            markHolidays(data.response.holidays);
        }
        return data.response.holidays;
    }
    catch(error){   
        console.log(`There was an error: ${error}`);
    }
}

let updateMonthAndYear = (currentMonth, currentYear, move) => {
    let totalMonths = currentMonth + move;
    
    let newYear = currentYear + Math.floor(totalMonths / 12);
    let newMonth = totalMonths % 12;

    if (newMonth < 0) {
        newMonth += 12;
    }

    return { year: newYear, month: newMonth };
};

let move = 0;

// Event listener for 'next' button to move forward one month

let next = document.querySelector('.next');
next.addEventListener('click', ()=> {
    move++;
    main(move);
})
// ... and 'previous' button

let previous = document.querySelector('.previous');
previous.addEventListener('click', ()=> {
    move--;
    main(move);
})


function main(move) {
    console.clear();

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth(); 

    let result = updateMonthAndYear(month, year, move); // Store result in a variable

    makeaTemplate(result.year, result.month); // Pass the result to makeaTemplate

    isCalled = true;
    fetchPromise(api_key, result.year, country, result.month+1);

    if (move == 0) {
        for (let day of document.querySelectorAll('td')) {
            if(day.innerText == date.getDate()) {
                day.style.backgroundColor = '#dc0101';
                day.style.color = '#fff';
                
            }
        }
    }
}

function makeaTemplate(year, month) {
    let months = ['January', 'February', 'March', 'April',
                  'May', 'June', 'July', 'August', 'September',
                  'October', 'November', 'December'];

    let selectedMonth = months[month];

    let title = document.querySelector('.calendar_title');
    title.innerText = selectedMonth + " " + year + ".";

    let first = new Date(year,month,1);
    let last = new Date(year, month + 1, 0);

    let dayInWeekFirst = first.getDay();
    if (dayInWeekFirst == 0) dayInWeekFirst = 7;

    let dayInWeekLast = last.getDay();
    if (dayInWeekLast == 0) dayInWeekLast = 7;

    let days = [];

    for (let i = 1; i < dayInWeekFirst; i++) {
        days.push("");
    }

    for (let i = 1; i <= last.getDate(); i++) {
        days.push(i);
    }

    for (let i = dayInWeekLast; i < 7; i++) {
        days.push("");
    }

    let weeks = [];

    for (let day of days) {
        weeks.push(days.splice(0,7));
    }
    top_month = month;
    top_year = year;
    fillTheCalendar(weeks);

}

// Function to fill the calendar with the days and add notes (if any)

function fillTheCalendar(weeks){
    document.querySelector('.calendar_body').innerHTML = '';
    for (let week of weeks) {
        let tr = document.createElement('tr');
        for (let day of week) {
            let td = document.createElement('td');
            td.innerHTML = `<div class="broj">${day}</div>`;
            tr.appendChild(td);
        }
        document.querySelector('.calendar_body').appendChild(tr);
    }
}

const dateInput = document.querySelector('.calendar-input');

dateInput.addEventListener('input', async function(event) {
    document.querySelector('.description').style.display = 'block';
    const selectedDate = event.target.value;
    let [year, month, date] = selectedDate.split("-");
    
    isCalled = false;
    let holidays = await fetchPromise(api_key, year, country, month);

    let isHoliday = holidays.some(holiday => holiday.date.datetime.day == date && 
                                            holiday.date.datetime.month == month && 
                                            holiday.date.datetime.year == year);

    document.querySelector(".description").innerText = isHoliday 
        ? `Yes, this is a holiday! 🎉` 
        : `No, this is not a holiday.`;

        for (let holiday of holidays) {
            if (holiday.date.datetime.day == date && 
                holiday.date.datetime.month == month && 
                holiday.date.datetime.year == year){
                    document.querySelector(".description").innerHTML += `<p>It is ${holiday.name}.</p>`
                }
        }
});


window.addEventListener('load', main(0));