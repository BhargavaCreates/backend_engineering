const express = require("express");
const cluster = require("cluster");
const os = require("os")

const app = express();

let numCpu = os.cpus().length

app.get("/",(req,res) => {
    res.send(`hey, you're @ /, and this server has ${numCpu} CPUs, this request was served by pid: ${process.pid}`)
    // kill worker on request completion to test cluster.on exit.
    // cluster.worker.kill()
}) 


// master -- does not listen to requests, it forks worker process.
// we only want the workers to take care of the requests.
// if master process, we would create worker process equal to the number of cpus present

if(cluster.isMaster) {
    for(let i = 0; i < numCpu; i++) {
        cluster.fork()
    }
    // attach even listen on worker exit.
    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker with ${worker.process.pid} died.`)
        // fork a new cluster  -- 
        cluster.fork()
        // Above shows if a worker exits, we create can create a new one.
    })
} else {
    // workers could run on same fork, but would have different pid's
    app.listen(3001, () => console.log(`server @ http://localhost:3001 pid: ${process.pid}`));
}


// app.listen(3001, () => console.log(`server @ http://localhost:3001 pid: ${process.pid}`));


