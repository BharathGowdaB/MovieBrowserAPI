import serverlessHttp from 'serverless-http';
import app from './app';

// Use the serverless-http middleware
const handler = serverlessHttp(app);

// Export the handler for Lambda
module.exports.handler = async (event, context) => {
    const result = await handler(event, context);
    return result;
};
