const awsServerlessExpress = require('aws-serverless-express');
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    try {
        console.log("Starting");
        res.status(200).send("API running");
        console.log("Completed");
    } catch (err) {
        console.log("Error", err);
        res.status(500).send("Internal Server Error");
    }
});

const server = awsServerlessExpress.createServer(app);

// Correctly export the handler
module.exports.postHandler = (event, context) => {
    console.log("Inside POST Method");
    awsServerlessExpress.proxy(server, event, context);
};