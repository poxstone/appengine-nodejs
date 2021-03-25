// Get dependencies
let express       = require('express')
let path          = require('path')
let http          = require('http')
let bodyParser    = require('body-parser')
const {CloudTasksClient} = require('@google-cloud/tasks');
var logger        = require('morgan')
const cors = require('cors')

let app = express();
app.enable('trust proxy');
app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

app.use(function(req, res, next) {
  //set headers to allow cross origin request.
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', '*');
  res.header("Access-Control-Allow-Headers", "*");
  next();
})

app.use(cors());

app.use(express.static(path.join(__dirname, 'dist')));


async function createTask(isAppEngine=false, inSeconds=60) {
  console.log('INIT: createTask');
  const project = 'my-project';
  const queue = 'my-queue';
  const location = 'us-central1';
  const payload = 'Hello, World!';
  const path = '/task';
  const url = 'https://prueba-dot-my-project.appspot.com' + path;
  
  const client = new CloudTasksClient();
  const parent = client.queuePath(project, location, queue);

  var task = {};

  if (isAppEngine) {
    task = {
      appEngineHttpRequest: {
        httpMethod: 'POST',
        relativeUri: path,
      },
    };
    if (payload) {
      task.appEngineHttpRequest.body = Buffer.from(payload).toString('base64');
    }
  } else {
    task = {
      httpRequest: {
        httpMethod: 'GET',
        url,
      },
    };
  }
  

  if (inSeconds) {
    // The time when the task is scheduled to be attempted.
    task.scheduleTime = {
      seconds: inSeconds + Date.now() / 1000,
    };
  }

  console.log('Sending task:');
  console.log(task);
  // Send create task request.
  const request = {parent, task};
  const [response] = await client.createTask(request);
  const name = response.name;
  console.log(`Created task ${name}`);
}

app.get('/', (req, res) => {
  console.log('Hola mundo warning 1');
  let isAppEngine = req.query.isAppEngine ? req.query.isAppEngine == 'true' : false;
  let inSeconds = req.query.timeout ? parseInt(req.query.timeout) : 60;
  createTask(isAppEngine, inSeconds);
  res.status(200).send('Hello, world 3!').end();
});

app.get('/task', (req, res) => {
  console.log('Task - GET', req);
  res.status(200).send('Hello, task').end();
});

app.post('/task', (req, res) => {
  console.log('Task - POST', req);
  console.error('Task(error) - POST', req);
  res.status(200).send('Hello, task').end();
});

let port = process.env.PORT || '3200';
app.set('port', port);

let server = http.createServer(app);
server.listen(port, () => console.log(`***** Magic happens on localhost:${port} *****`));
