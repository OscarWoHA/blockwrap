const { spawn } = require('child_process');
const config = require('./config.json');

class Server {
    constructor(name, runnable, args, directory, command) {
        this.name = name;
        this.command = config.commands[command].command;
        this.command = this.command.replace('$before', args.before);
        this.command = this.command.replace('$after', args.after);
        this.command = this.command.replace('$file', runnable);
        this.directory = directory;
        this.log = [];
    }

    start() {
        let self = this;

        this.process = spawn('/bin/sh', ['-c', `cd ${this.directory} && ${this.command}`]);
        
        this.process.stdout.on('data', (data) => {
            self.log.push(data);
        });

        this.process.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }

    stop() {
        this.process.kill('SIGINT');
    }
}

class Application {
    constructor() {
        this.servers = [];

        for (let server of config.servers) {
            this.servers.push(new Server(server.name, server.runnable, server.arguments, server.directory, server.command));
        }

        for (let server of this.servers) {
            server.start();
        }

        process.on('SIGINT', function () {
            for (let server of this.servers) {
                server.stop();
            }
        });

        process.on('SIGTERM', function () {
            for (let server of this.servers) {
                server.stop();
            }
        });
    }
}


new Application();