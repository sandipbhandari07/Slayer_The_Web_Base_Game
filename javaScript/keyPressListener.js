class keyPressListener {
    constructor(keyCode, callback) {
        let keySafe = true; // the key pressed works only if it is true 


        //  function to set the value of keysafe to false
        this.keydownFunction = function(event) {
            if (event.code === keyCode) {
                if (keySafe) {
                    keySafe = false;
                    callback();
                }
            }
        };

        // function to set the value of keysafe to true so we can press again 

        this.keyupFunction = function(event) {
            if (event.code === keyCode) {
                keySafe = true;
            }
        };


        document.addEventListener("keydown", this.keydownFunction);
        document.addEventListener("keyup", this.keyupFunction);
    }


    // after message finish displaying the key is unbinded so it does not work even if we press it
    unbind() {
        document.removeEventListener("keydown", this.keydownFunction);
        document.removeEventListener("keyup", this.keyupFunction);
    }

}