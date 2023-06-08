class CraftingMenu {
    constructor({ pizzas, onComplete}) {
      this.pizzas = pizzas;
      this.onComplete = onComplete;
    }
  
    //options on pizzas
    getOptions() {
      return this.pizzas.map(id => {
        const base = Pizzas[id];
        return {
          label: base.name,
          description: base.description,
          handler: () => {
              //create a wasy to add pizza to playerState
            playerState.addPizza(id);
            this.close();
          }
        }
      })
    }
  
    //creaing menu
    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("CraftingMenu");
      this.element.classList.add("overlayMenu");
      this.element.innerHTML = (`
        <h2>Choose One pizza</h2>
      `)
    }
    //close the menu
    close() {
      this.keyboardMenu.end();
      this.element.remove();
      this.onComplete();
    }
  
  
    main(container) {
      this.createElement();
      this.keyboardMenu = new KeyboardMenu({
        descriptionContainer: container
      })
      this.keyboardMenu.main(this.element)
      this.keyboardMenu.setOptions(this.getOptions())
  
      container.appendChild(this.element);
    }
  }