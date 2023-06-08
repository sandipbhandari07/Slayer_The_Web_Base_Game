class KeyboardMenu{
    constructor(config={}){
        this.options=[];//set by the updater method
        this.up=null;
        this.down=null;
        this.prevFocus=null;
        this.descriptionContainer = config.descriptionContainer || null;
    }

    setOptions(options){
        //for option menu
        this.options=options;
        this.element.innerHTML=this.options.map((option,index)=>{
            const disabledAttr =option.disabled ? "disabled" : ""; // to see if the menu is disabled or not
            
            return (`
            <div class="option">
            <button ${disabledAttr} data-button="${index}" data-description="${option.description}">
            ${option.label}
            </button>
            <span class="right">${option.right ? option.right() : ""}</span>
            </div>
            `)
        }).join("");

        this.element.querySelectorAll("button").forEach(button=>{ 

            //to ckeck which option has been selected/clicked 
            button.addEventListener("click",()=>{
                const chosenOption=this.options[Number(button.dataset.button)];
                chosenOption.handler();
            })
            //highlight selected options
            button.addEventListener("mouseenter",()=>{
                button.focus();
            })
            // show the information on the selected option
            button.addEventListener("focus",()=>{
                this.prevFocus=button;
                this.descriptionElementText.innerText=button.dataset.description;
            })

        })

        setTimeout(() => {
            this.element.querySelector("button[data-button]:not([disabled])").focus();
          }, 10)

    }


    createElement(){
        this.element=document.createElement("div");
        this.element.classList.add("KeyboardMenu");

        //discription box element

        this.descriptionElement = document.createElement("div");
        this.descriptionElement.classList.add("DescriptionBox");
        this.descriptionElement.innerHTML=(`<p>information</p>`);
        this.descriptionElementText=this.descriptionElement.querySelector("p");
    }

    //called when ever we are done with the menu 
    end(){

        //remove menu element and discription element
        this.element.remove();
        this.descriptionElement.remove();

        //clean up bindings
        this.up.unbind();
        this.down.unbind();
    }


    main(container){
        this.createElement();
        (this.descriptionContainer ||container).appendChild(this.descriptionElement);
        container.appendChild(this.element);

        //to select upper option in Menu // search algorithm
        this.up = new keyPressListener("ArrowUp", ()=>{
            const current = Number(this.prevFocus.getAttribute("data-button"));
             //to find the button which is less & not disabled buttons and focus it
             const prevButton = Array.from(this.element.querySelectorAll("button[data-button]")).reverse().find(el =>{
                return el.dataset.button < current && !el.disabled;
            })
            prevButton ?.focus();
        })

        //to select below option in Menu  // search algorithm
        this.down = new keyPressListener("ArrowDown", ()=>{
            const current = Number(this.prevFocus.getAttribute("data-button"));
            //to find the button which is greater then and not disabled buttons and focus it
            const nextButton = Array.from(this.element.querySelectorAll("button[data-button]")).find(el =>{
                return el.dataset.button> current && !el.disabled;
            })
            nextButton ?.focus();
        })
    }
}