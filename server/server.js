const express = require('express');
const app = express();
let users = [];
let nextUserId = 0;

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send("connection works!");
});

app.get('/users', (req, res) => getUsers(req, res));

app.post('/register', (req, res) => registerUser(req, res))

app.post('/steps', (req, res) => postSteps(req, res));

app.delete('/user', (req, res) => unregisterUser(req, res))

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

function registerUser(req, res) {
  const {lat, long} = req.body;
  const userId = nextUserId++;
  let headingArray = []
  let sessionId = new Date().toUTCString();

  users.push({userId, lat, long, headingArray, sessionId});
  console.log(users[nextUserId - 1]);

  // Respond with the generated user ID
  res.send(userId.toString());
}

function getUsers(req, res) {
  res.send(users);
}

function postSteps(req, res) {
  const {userId, heading} = req.body;
  console.log(userId, heading);
  const index = users.findIndex(obj => obj.userId === userId);
  if (index !== -1) {
    users[index].headingArray.push(heading);
  }

}


function unregisterUser(req, res) {
  console.log("Got unregister user request")
  const userId = req.body.userId
  console.log(req.body)
  console.log(parseInt(userId))

  const index = users.findIndex(obj => obj.userId === userId);
  if (index !== -1) {
    users.splice(index, 1);
  }
  res.send(users);
}

