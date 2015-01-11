window.onload = function(){

    var ViewPort = document.createElement("div");
    ViewPort.style.whiteSpace = "pre-wrap";
    document.body.appendChild(ViewPort);

    var BufferView = document.createElement("div");
    BufferView.style.whiteSpace = "pre-wrap";
    document.body.appendChild(BufferView);

    var bufferedChar = document.createElement("span");


    var Display = {

        print: function(args){
            ViewPort.appendChild(document.createTextNode(args));
            ViewPort.appendChild(document.createTextNode("\n"));
        }
    };

    function help(){
        Display.print("Welcome to a very basic command line in the browser! \n" +
            "    ?, help : prints this.\n" +
            "      print : prints to the current display.\n" +
            "       eval : runs in eval mode - type \"exit\" to return to rlsh.\n" +
            "   download : gets an aliased resource that is publicly available via HTTP.\n" +
            "              So far, the available aliases are \"resume\", \"JSCompile\",\n" +
            "              and rlsh." +
            "     reload : reloads the page.\n" +
            "       home : goes back to the home page.\n" +
            "      clear : clears the console."
        );
    }

    var interpret;

    var DefaultInterpreter;


    var Evil = function(commandString){
        if(commandString.indexOf("exit") > -1){
            Display.print("No more eval for you.");
            interpret = DefaultInterpreter;
            return;
        }

        try{
            Display.print(eval(commandString));
        }catch(e){
            Display.print(e.message);
        }

    };

    var resourceAddresses = {
        resume: "/resume.pdf",
        JSCompile: "https://github.com/rliota/JSCompile/releases/download/v0/JSCompile.jar",
        rlsh: '/js/Buffer.js'
    };

    var Commands = {
        'help': help,
        '?' : help,
        'print': Display.print,
        'eval': function(){
            interpret = Evil;
        },
        'download': function(resource){
            if(resource){
                window.location.href = resourceAddresses[resource];
            }
        },
        'reload': function(){
            window.location.reload();
        },
        'home': function(){
            window.location.href = "/";
        },
        'clear': function(){
            ViewPort.innerHTML = "";
        }
    };



    function Buffer(){
        this.environment = {};
        this.writeChar(" ", true);
        this.buffer = "";
        this.commandList = [];
        this.commandIndex = 0;
        this.caretPosition = 0;

        interpret = this.defaultInterpreter.bind(this);
        DefaultInterpreter = this.defaultInterpreter.bind(this);
    }

    Buffer.prototype.run = function(){
        var i= 0, iLen = arguments.length;
        var argString = "";
        for(i; i<iLen; i++){
            argString += arguments[i];
        }
        try{
            Display.print(eval(argString));
        }catch(e){
            Display.print(e.message);
        }
    };

    Buffer.prototype.writeChar = function(character, atCaret){
        var newChar = bufferedChar.cloneNode(false);
        newChar.textContent = character;
        newChar.className = atCaret ? "caret" : "";
        BufferView.appendChild(newChar);
    };
    Buffer.prototype.writeBuffer = function(){
        BufferView.innerHTML = "";
        var i= 0, iLen = this.buffer.length;
        for(i; i<iLen; i++){
            this.writeChar(this.buffer[i], i===this.caretPosition);
        }
        if(this.caretPosition >= iLen){
            this.writeChar(" ", true);
        }
    };

    Buffer.prototype.commandRegEx = /".+?[^\\]"|[^\s]+/g;

    Buffer.prototype.defaultInterpreter = function(commandString){
        var commandAndArgs = commandString.match(this.commandRegEx);
        var iLen = commandAndArgs.length;
        var commandName = iLen > 0 ? commandAndArgs[0] : "";
        var command = Commands[commandName];
        if(command){
            var args = commandAndArgs.slice(1);

            command.apply({}, args);
        }else{
            Display.print('Command "'+commandName+'" not found');
//            this.run.apply(this.environment, commandAndArgs);
        }
    };


    Buffer.prototype.commit = function(){
        if(this.buffer.length > 0){
            if(this.buffer == "!!"){
                var prev = this.previousCommand();
                if(prev){
                    this.commit();
                }else{
                    Display.print("No previous command exists.")
                }
                return;

            }
            this.commandList.push(this.buffer);
            this.commandIndex = this.commandList.length;
            this.caretPosition = 0;
            Display.print(this.buffer);
            interpret(this.buffer);
            this.buffer = "";
            this.uncommittedBuffer = "";
            this.writeBuffer();
        }
    };

    Buffer.prototype.remove = function(offset){
        var b = this.buffer;
        var delIndex = this.caretPosition+offset;
        if(offset>0){ //del
            this.buffer = b.substring(0,this.caretPosition) + b.substring(delIndex, b.length);
        }else{//backspace
            this.buffer = b.substring(0, delIndex) + b.substring(this.caretPosition);
            this.caretPosition = this.caretPosition <= 0 ? 0 : this.caretPosition-1;
        }

        this.writeBuffer();
    };

    Buffer.prototype.moveCaret = function(offset){
        var projectedIndex = offset+this.caretPosition;
        if(projectedIndex > this.buffer.length){
            projectedIndex = this.buffer.length;
        }else if(projectedIndex < 0){
            projectedIndex = 0;
        }
        this.caretPosition = projectedIndex;
        this.writeBuffer();
    };

    Buffer.prototype.previousCommand = function(){
        var projectedCommandIndex = this.commandIndex-1;
        projectedCommandIndex = projectedCommandIndex > -1 ? projectedCommandIndex : -1;
        var commands =this.commandList.length;
        if(projectedCommandIndex < commands && projectedCommandIndex > -1){
            this.buffer = this.commandList[projectedCommandIndex];
            this.commandIndex = projectedCommandIndex;
            this.caretPosition = this.buffer.length;
            this.writeBuffer();
            return true;
        }else{
            return false;
        }
    };

    Buffer.prototype.nextCommand = function(){
        var projectedCommandIndex = this.commandIndex+1;
        var commandsLength =this.commandList.length;
        if(commandsLength > 0){
            projectedCommandIndex = projectedCommandIndex < commandsLength ? projectedCommandIndex : commandsLength;
            if(projectedCommandIndex < commandsLength){
                this.buffer = this.commandList[projectedCommandIndex];
            }else{
                this.buffer = this.uncommittedBuffer;
            }
            this.caretPosition = this.buffer.length;
            this.commandIndex = projectedCommandIndex;
            this.writeBuffer();
        }
    };

    Buffer.prototype.log = function(character){
        var insertionPoint = this.caretPosition;
        var b = this.buffer;
        this.buffer = b.substring(0,insertionPoint) + character + b.substring(insertionPoint);
        this.uncommittedBuffer = this.buffer;
        this.caretPosition++;
        this.writeBuffer();
    };

    var buffer = new Buffer();


    function logKeyPress(evt){
        var key = evt.key;
        if(key){
            switch (key){
                case 'Enter':
                    buffer.commit();
                    break;
                case 'Backspace':
                    buffer.remove(-1);
                    break;
                case 'Del':
                    buffer.remove(1);
                    break;
                case 'Up':
                    buffer.previousCommand();
                    break;
                case 'Down':
                    buffer.nextCommand();
                    break;
                case 'Left':
                    buffer.moveCaret(-1);
                    break;
                case 'Right':
                    buffer.moveCaret(1);
                    break;
                default:
                    buffer.log(key);
            }
        }else{
            buffer.log(String.fromCharCode(evt.which || evt.keyCode));
        }
        window.scrollTo(0,document.body.offsetHeight);
        evt.preventDefault();
    }

    window.onkeypress = logKeyPress;

    var batteryInfo = window.navigator.battery;

    Display.print(new Date().toString() + (batteryInfo ? " - Battery: " + (batteryInfo.level * 100) + "%" : "") );
    help();


};