class TextMessage {
    constructor({ text, onComplete }) {
        this.text = text;
        this.onComplete = onComplete;
        this.element = null;
    }

    createElement() {

        // creating the element
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        //creating Inner div for Text
        this.element.innerHTML = (`
            <p class="TextMessage_p" > </p>
            <button class="TextMessage_button">Next</button> `)

        //for typewriter effect
        this.revealingText = new RevealingText({
            element: this.element.querySelector(".TextMessage_p"), //to find the TextMessage_p from the element
            text: this.text
        })

        //adding event listener to the mouse button so we can click it 
        this.element.querySelector("button").addEventListener("click", () => {
            //close the text message
            this.done();
        });

        //adding event listener to the enter key 
        this.actionListener = new keyPressListener("Enter", () => {
            this.done();
        });

            //adding event listener to the spacem key 
        this.actionListener = new keyPressListener("Space", () => {
            this.done();
        });
    }

    //method for done
    done() {
        if (this.revealingText.isDone) {
            this.element.remove();
            this.actionListener.unbind();
            this.onComplete();
        } else {
            this.revealingText.wrapToDone();
        }
    }

    main(container) {
        this.createElement();
        container.appendChild(this.element);
        this.revealingText.main();
    }

}