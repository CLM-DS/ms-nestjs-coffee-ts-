import http from "k6/http";
import { check } from "k6";
import { Rate } from "k6/metrics";

// These are still very much WIP and untested, but you can use them as is or write your own!
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// A custom metric to track failure rates
var failureRate = new Rate("check_failure_rate");

export let options = {
    setupTimeout: '100s',
    stages: [
        // Ramp-up from 1 to 5 VUs in 5s
        { duration: "5s", target: 5 },

        // Stay at rest on 5 VUs for 5s
        { duration: "5s", target: 5 },

        // Ramp-down from 5 to 0 VUs for 5s
        { duration: "5s", target: 0 },
    ],
    thresholds: {
        // Declare a threshold over all HTTP response times,
        // the 95th percentile should not cross 500ms
        "http_req_duration": ["p(95)<1000"],

        // Declare a threshold over HTTP response times for all data points
        // where the URL tag is equal to "http://httpbin.org/post",
        // the max should not cross 1000ms
        "http_req_duration{url:https://apicoffee.clm.team/coffees}": ["max<1000"],
        // Thresholds based on the custom metric we defined and use to track application failures
        "check_failure_rate": [
            // Global failure rate should be less than 1%
            "rate<0.01",
            // Abort the test early if it climbs over 5%
            { threshold: "rate<=0.05", abortOnFail: true },
        ],
    }
};

export default function() {
    let res = http.get("https://apicoffee.clm.team/coffees");
    // Use JSON.parse to deserialize the JSON (instead of using the r.json() method)
    let j = JSON.parse(res.body);
    // check() returns false if any of the specified conditions fail
    let checkRes = check(res, {
        "status is 200": (r) => r.status === 200,
    });
    // We reverse the check() result since we want to count the failures
    failureRate.add(!checkRes);
}

export function handleSummary(data) {
    console.log('Preparing the end-of-test summary...');
    // Send the results to some remote server or trigger a hook
    let resp = http.post('https://httpbin.test.k6.io/anything', JSON.stringify(data));
    if (resp.status != 200) {
        console.error('Could not send summary, got status ' + resp.status);
    }
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true}), // Show the text summary to stdout...
        'k6-junit.xml': jUnit(data), // but also transform it and save it as a JUnit XML...
        'k6-summary.json': JSON.stringify(data), // and a JSON with all the details...
        // And any other JS transformation of the data you can think of,
        // you can write your own JS helpers to transform the summary data however you like!
    }
}