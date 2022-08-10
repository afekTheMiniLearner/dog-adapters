const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mainRouter = require('./routers/main.router');
const dogsRouter = require('./routers/dogs.router');
const authRouter = require('./routers/auth.router');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', mainRouter);
app.use('/dogs', dogsRouter);
app.use('/auth', authRouter);

app.use((err, req, res, next) => {
    console.error(`${req.method}:${req.originalUrl}, failed with error:${err}`);
    next(err);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server is up on: http://localhost:${PORT}`);
});
