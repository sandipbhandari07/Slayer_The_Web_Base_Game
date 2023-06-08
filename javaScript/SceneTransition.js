class SceneTransition {
    constructor() {
        this.element = null;
    }
    createElement() {
        this.element = document.createElement("div"); // making new div
        this.element.classList.add("SceneTransition"); //takes the css we added 

    }


    fadeOut() {
        this.element.classList.add("fade-out");
        this.element.addEventListener("animationend", () => {
            this.element.remove();
        }, { once: true })
    }

    main(container, callback) {
        this.createElement();
        container.appendChild(this.element);

        //to know that css animation is completed
        this.element.addEventListener("animationend", () => {
                callback();
            }, { once: true }) // only do it once
    }




}