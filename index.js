const serverlessHttp = require('serverless-http');
const express = require('express');
const routes = require('./routes/route');

const app = express();
app.use(express.json());
app.use('/', routes);

// Use the serverless-http middleware
const handler = serverlessHttp(app);

// Export the handler for Lambda
module.exports.handler = async (event, context) => {
    const result = await handler(event, context);
    return result;
};
