const express = require('express');
const amqplib = require('amqplib');
const logger = require('chpr-logger');

const app = express();

const AMQP_URL = process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672';
const EXCHANGE = 'drivers';
const ROUTING_KEY = 'drivers.update';
const QUEUE = 'update_drivers';

let client;

/**
 * Initialize the connection with RabbitMQ, bind the exchance with the queue and consume the messages
 */

async function start() {
    logger.info('RabbitMQ initialization');
    client = await amqplib.connect(AMQP_URL);
    client.channel = await client.createChannel();
    await client.channel.assertExchange(EXCHANGE, 'topic', {
        durable: false
    });
    await client.channel.assertQueue(QUEUE, {
        durable: false
    });
    await client.channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
    logger.info(" [*] Waiting for messages in %s. To exit press CTRL+C", QUEUE);
    await client.channel.consume(QUEUE, function(msg) {
        logger.info("Message content: %s", msg.content.toString());
    }, {noAck: true});

}



/**
 * Set the port of the server
 */
app.set('port', (process.env.PORT || 3001));


/**
 * 'api/drivers'
 * GET: get the updated coordinates of the drivers from RabbitMQ queue
 */
app.get('/api/drivers', (req, res) => {
    start();
    res.status(201).json('this is working');
});








app.listen(app.get('port'), () => {
    console.log(`App running at http://localhost:${app.get('port')}/`);
});
