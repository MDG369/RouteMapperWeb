const express = require('express');
const app = express();
const path = require('path');
let users = [];
let nextUserId = 0;

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Serve static files from the Angular app
app.use(express.static(__dirname + '/../src/assets/svg/map-svgrepo-com.svg'));

// Handle GET requests to serve the Angular app
app.get('/', function(req, res) {
  res.send("connection works!");
});

app.get('/users', (req, res) => getUsers(req, res));

app.post('/register', (req,res) => registerUser(req, res))

app.post('/steps', (req, res) => postSteps(req, res));

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

function registerUser(req, res) {
  // Extract latitude and longitude from the request body
  const { lat, long } = req.body;

  // Mock logic to generate user ID and store user data
  const userId = nextUserId++;
  let headingArray = []
  users.push({userId, lat, long, headingArray});
  console.log(users[nextUserId-1]);
  // Respond with the generated user ID
  res.send(userId.toString());
}

function getUsers(req, res) {
  res.send(users);
}

function postSteps(req, res) {
  const { userId, heading } = req.body;
  console.log(userId, heading);
  users[userId].headingArray.push(heading);
}

function getSteps(req, res) {
  // TODO Frontend sends userId and gets the users steps from server
}

function unregisterUser(req, res) {
  // TODO Mobile sends shutdown signal to server, Server knows the user is no longer present. Whenever Frontend sends getUsers
  // the server notifies it about the unregistering
}

