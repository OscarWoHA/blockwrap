const spawn = require('child_process').spawn;
const config = require('./config.json');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

var Server = function() {
    this.log = [];
    this.live = false;

    this.setup = function(name, file, arguments, directory, command) {
        this.name = name;
        this.file = file;
        this.arguments = arguments;
        this.directory = directory;
        this.command = command;
    }

    this.start = function() {
        command = config.commands[this.command].command;
        command = command.replace('$before', this.arguments.before);
        command = command.replace('$file', this.file);
        command = command.replace('$after', this.arguments.after);

        this.ps = spawn('/bin/sh', [ '-c', 'cd ' + this.directory + ' && ' + command], {detached: true});

        this.running = true;

        this.ps.stdout.setEncoding('utf8');
        this.ps.stdout.on('data', (data) => {
            lines = data.toString().split('\n');
            for(index = 0; index < lines.length; index++)  {
                if(!lines[index]) {
                    continue;
                }

                this.logMessage(lines[index]);
            }
        });

        this.ps.stderr.on('data', (data) => {
            lines = data.toString().split('\n');
            for(index = 0; index < lines.length; index++)  {
                if(!lines[index]) {
                    continue;
                }

                this.logMessage(lines[index]);
            }
        });

        this.ps.on('close', (code) => {
            this.logMessage('Process killed');
            this.running = false;
        });
    }

    this.logMessage = function(message) {
        this.log.push(message);

        if(this.live) {
            console.log('\r['+ this.name + '] ' + message);
            rl.prompt();
        }
    }

    this.stop = function() {
        process.kill(-this.ps.pid, 'SIGKILL');
    }

    this.liveView = function(status) {
        if(status) {
            for(index = 0; index < this.log.length; index++) {
                console.log('['+ this.name + '] ' + this.log[index]);
            }

            this.live = true;
        } else {
            process.stdout.write('\033c');
            this.live = false;
        }
    }
}

var Application = function() {
    this.servers = [];

    this.boot = function() {
        this.start();
    }

    this.start = function() {
        for(index = 0; index < config.servers.length; index++) {
            server = config.servers[index];

            serverInst = new Server();

            serverInst.setup(server.name, server.file, server.arguments, server.directory, server.command);

            this.servers.push(serverInst);
        }

        rl.prompt();
        rl.on('line', (input) => {
            if(!input) {
                return;
            }

            args = input.split(' ');
            command = args[0];
            args.splice(0, 1);

            switch(command.toUpperCase()) {
                case 'SELECT':
                if(args.length == 0) {
                    console.log('Invalid amount of arguments.. \nUsage: SELECT {name}');
                    break;
                }

                for(index = 0; index < this.servers.length; index++) {
                    if(this.servers[index].name == args[0]) {
                        this.selected = index;

                        console.log('Server ' + this.servers[index].name + ' selected.');
                        break;
                    }
                }
                break;

                case 'START':
                if(!this.servers[this.selected].running) {
                    this.servers[this.selected].start();
                } else {
                    console.log('Server is already running!');
                }
                break;

                case 'STOP':
                if(this.servers[this.selected].running) {
                    this.servers[this.selected].stop();
                } else {
                    console.log('Server is not running!');
                }
                break;

                case 'LIVE':
                if(args.length == 0) {
                    console.log('Invalid amount of arguments..\nUsage: LIVE {true/false}');
                    break;
                }

                if(args[0] == 'true') {
                    if(!this.servers[this.selected].live) {
                        this.servers[this.selected].liveView(true);
                        console.log('Live view enabled.');
                    } else {
                        console.log('Live view is already enabled!');
                    }
                } else if (args[0] == 'false') {
                    if(this.servers[this.selected].live) {
                        this.servers[this.selected].liveView(false);
                        console.log('Live view disabled.');
                    } else {
                        console.log('Live view is already disabled!');
                    }
                } else {
                    console.log('Usage: LIVE {true/false}');
                }
                break;

                case 'EXIT':

                console.log('Stopping all servers..');
                for(index = 0; index < this.servers.length; index++) {
                    server = this.servers[index];
                    if(server.running) {
                        server.stop();
                    }
                }

                console.log('Have a great day!');
                process.exit(0);
                break;

                default:
                console.log('Commands are: SELECT, STOP, START and LIVE');
                break;
            }

            rl.prompt();
        }).on('close', () => {
            console.log('Stopping all servers..');
            for(index = 0; index < this.servers.length; index++) {
                server = this.servers[index];
                if(server.running) {
                    server.stop();
                }
            }

            console.log('Have a great day!');
            process.exit(0);
        });
    }
}

new Application().boot();
