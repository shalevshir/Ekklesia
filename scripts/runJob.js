const Queue = require('bull');

// Create a queue
const myQueue = new Queue('workerQueue', process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379');

// Function to add a job to the queue
async function addJobToQueue(eventName, data) {
    try {
        await myQueue.add(eventName, data);
        console.log(`Job for event '${eventName}' added to the queue with data:`, data);
        process.exit(0);
    } catch (error) {
        console.error('Error adding job to the queue:', error);
    }
}

// Get command line arguments
const eventName = process.argv[2]; // The event name
let jobData = {};

console.log('process.argv:', process.argv);
if (process.argv.length > 3) {
    // Assuming the third argument is a JSON string of job data
    try {
        jobData = JSON.parse(process.argv[3]);
    } catch (error) {
        console.error('Error parsing job data:', error);
        process.exit(1);
    }
}

// Ensure an event name is provided
if (!eventName) {
    console.error('Please provide an event name.');
    process.exit(1);
}

// Trigger the function with your job data
addJobToQueue(eventName, jobData);

// Add the following code to stop the script
