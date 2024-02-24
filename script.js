const firebaseConfig = {
    apiKey: "AIzaSyCBJenbt7D6vJ6QTRznrDGAoL9N6vOhcPM",
    authDomain: "bookingform-367e5.firebaseapp.com",
    databaseURL: "https://bookingform-367e5-default-rtdb.firebaseio.com",
    projectId: "bookingform-367e5",
    storageBucket: "bookingform-367e5.appspot.com",
    messagingSenderId: "449682136408",
    appId: "1:449682136408:web:094c0bca48c6df2a8b192d"
  };
  
  firebase.initializeApp(firebaseConfig);
  
  var bookingFormDB = firebase.database().ref('bookingForm');
  
  document.getElementById('bookingForm').addEventListener('submit', submitbooking);
  
  async function fetchBookedDays() {
    try {
        const snapshot = await firebase.database().ref('bookingForm').once('value');
        const existingBookings = snapshot.val();
        const bookedDays = calculateBookedDays(existingBookings);
        console.log('Booked Days:', bookedDays);
        updateBookedDaysUI(bookedDays);
    } catch (error) {
        console.error('Error fetching booked days:', error);
    }
  }
  
  function calculateBookedDays(existingBookings) {
    const bookedDays = new Array(7).fill(false);
  
    Object.values(existingBookings).forEach(existingBooking => {
        const bookingDate = new Date(existingBooking.date);
        bookedDays[bookingDate.getDay()] = true;
    });
  
    return bookedDays;
  }
  
  function updateBookedDaysUI(bookedDays) {
    console.log('Updating UI with booked days:', bookedDays);
  }
  
  async function isWithinTwoHoursOfAnotherBooking(bookingTime) {
    try {
        const existingBookings = await fetchExistingBookings();
  
        return Object.values(existingBookings).some(existingBooking => {
            const existingBookingTime = new Date(existingBooking.date + 'T' + existingBooking.time);
            const timeDiff = Math.abs(bookingTime - existingBookingTime);
            const diffInHours = timeDiff / (1000 * 60 * 60);
  
            return diffInHours < 7;
        });
    } catch (error) {
        console.error('Error checking if within eight hours of another booking:', error);
        return false;
    }
  }
  
  async function submitbooking(e) {
    e.preventDefault();
    var name = getElementVal('name');
    var service = getElementVal('service');
    var date = getElementVal('date');
    var time = getElementVal('time');
    var number = getElementVal('number');
    var additional = getElementVal('additional');
  
    var bookingTime = new Date(date + 'T' + time);
    
  
    if (bookingTime.getDay() >= 1 && bookingTime.getDay() <= 3) {
        if (bookingTime.getHours() < 16 || bookingTime.getHours() >= 19) {
            alert('Slots are only available between 4 pm and 7 pm on this day.');
            return;
        }
    }
    if (bookingTime.getDay() === 4){
        if (bookingTime.getHours() < 15 || bookingTime.getHours() >= 18) {
            alert('Slots are only available between 3:20pm and 6:20pm on this day.')
            return;
        }
    }
    
    if (bookingTime.getDay() === 5){
        if (bookingTime.getHours() < 16 || bookingTime.getHours() >= 19) {
            alert('Slots are only available between 4 pm and 7 pm on this day.')
            return;
        }
    }
    
    if (bookingTime.getDay() === 0) {
        alert('Cannot book slots on Sunday.');
        return;
    }
    
    if (bookingTime.getDay() === 6) {
        if (bookingTime.getHours() < 9 || bookingTime.getHours() >= 21) {
            alert('Cannot book before 9 am or after 9 pm on Saturday.');
            return;
        }
    }
    

    if (bookingTime.getDay() === 6) {
        if (await isWithinTwoHoursOfAnotherBooking(bookingTime)) {
        alert('This time slot is taken. Please select another time, or day.');
        return;
        }
    }  

   if (bookingTime.getDay() === 1 || bookingTime.getDay() === 2 || bookingTime.getDay() === 3 || bookingTime.getDay() === 4 || bookingTime.getDay() === 5) {
        if (await isWithinTwoHoursOfAnotherBooking(bookingTime)){
        alert('No Slots Available.');
        return;
        }
    }


    savedBookings(name, service, date, time, number, additional);
  
    document.querySelector('.alert').style.display = 'block';
  
    setTimeout(() => {
        document.querySelector('.alert').style.display = 'none';
    }, 3000);
  
    document.getElementById('bookingForm').reset();
  
    displayCompletelyBookedDays();
  
    fetchBookedDays();
  }
  
  function getBookingsCountForDay(selectedDate) {
    var existingBookings = fetchExistingBookings();
    return Object.values(existingBookings).filter(existingBooking => existingBooking.date === selectedDate).length;
  }
  
  function savedBookings(name, service, date, time, number, additional) {
    var newbookingForm = bookingFormDB.push();
  
    newbookingForm.set({
        name: name,
        service: service,
        date: date,
        time: time,
        number: number,
        additional: additional,
    });
  }
  
  const getElementVal = (id) => {
    return document.getElementById(id).value;
  };
  
  const displayCompletelyBookedDays = () => {
    var existingBookings = fetchExistingBookings();
    var bookedDays = new Array(7).fill(0);
  
    Object.values(existingBookings).forEach(existingBooking => {
        var bookingDate = new Date(existingBooking.date);
        bookedDays[bookingDate.getDay()]++;
    });
  
    bookedDays.forEach((count, dayIndex) => {
        if (count >= 1) {
            console.log(`${dayIndex}'s slots is full. Please select another day.`);
        }
    });
  };
  

  
  async function fetchExistingBookings() {
    try {
        const snapshot = await firebase.database().ref('bookingForm').once('value');
        return snapshot.val() || {};
    } catch (error) {
        console.error('Error fetching existing bookings:', error);
        throw error;
    }
  }