const express = require('express');
const app = express();
let users = [];
let nextUserId = 0;

const bodyParser = require('body-parser');
app.use(bodyParser.json());

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
  const { lat, long } = req.body;
  const userId = nextUserId++;
  let headingArray = []
  let sessionId = new Date().toUTCString();

  users.push({userId, lat, long, headingArray, sessionId});
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

function unregisterUser(req, res) {
  // TODO Mobile sends shutdown signal to server, Server knows the user is no longer present. Whenever Frontend sends getUsers
  // the server notifies it about the unregistering
}

