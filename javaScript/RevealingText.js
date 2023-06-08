class RevealingText {

    constructor(config) {
        this.element = config.element;
        this.text = config.text;
        //setting the speed of the text to be revealed
        this.speed = config.speed || 70; // 70 is given as default speed if the speed is not given

        this.timeout = null;
        this.isDone = false; // if this is true the message is instantly visible 
    }

    // revealing the words one by one
    revealOneCharacter(list) {
        const next = list.splice(0, 1)[0];
        next.span.classList.add("revealed");

        // looping through the array till its empty and showing after a certain dealy
        if (list.length > 0) {
            this.timeout = setTimeout(() => {
                this.revealOneCharacter(list)
            }, next.delayAfter)
        } else {
            this.isDone = true;
        }
    }

    // the message intantly reveals when enter key is pressed
    wrapToDone() {
        clearTimeout(this.timeout);
        this.isDone = true;
        //going through each span character and instantly reveling it 
        this.element.querySelectorAll("span").forEach(s => {
            s.classList.add("revealed");
        })
    }


    main() {
        let characters = [];
        //to split each characters into indivisual characters like ABC=["A","B","C"]
        this.text.split("").forEach(character => {
                let span = document.createElement("span"); // create each span and add to DOM
                span.textContent = character;
                this.element.appendChild(span);


                // add this span to our internal state Array
                characters.push({
                    span,
                    delayAfter: character === " " ? 0 : this.speed // no dealy when there is space between characters
                })

            })
            //showing words in the game
        this.revealOneCharacter(characters);
    }



}