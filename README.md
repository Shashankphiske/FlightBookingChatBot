# FlightBookingChatBot

the website url : https://flightbookingchatbot.netlify.app/, the backend is : https://flightbookingbackend.netlify.app/.netlify/functions/server/

you will be provided with a login page, if you dont have an account click on the register button and register yourself (if any errors just use : shashankphiske@gmail.com and pass : ssp )

On successful login you will redirected to the home page, here type in the origin, destination and travel date. You may also give the company and the flight class. Eg : 
"I want to go from Pune to Mumbai on 30th July". The text will be processes and you will be provided with a sample data that I have created. If that ticket has a price more than 0 then you will be shown a razorpay trial window when you click on Book Now button. If the price is 0 it will directly book the flight

In the Itinerary tab you will be provided with an upcoming flights list and a past flights  that you have taken. From here you can cancel the flights which you have booked.

In the profile you can change your name, email and phone number which willl reflect while booking your flights

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

the website and backend is deployed on netlify
I have used google'd dialogflow ai to extract relevant information from the text that the user types in. It extracts the source, destination, date, company, class from the text and sends it back to the express and node backend. Then the node and express backend filters the sample data accordingly and sends it to the frontend. I have also used jwt authentication for users. The frontend is built in react. I have integrated a razorpay trial api. I havent used the full blown razorpay api to handle payments as I didnt had any buisness information etc and also I didnt found any flight data openly available for free.

Thank you
