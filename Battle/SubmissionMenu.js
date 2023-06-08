class SubmissionMenu {

    constructor({ caster, enemy, onComplete,items,replacements }) {
        this.caster = caster;
        this.enemy = enemy;
        this.replacements=replacements;
        this.onComplete = onComplete;

            //adding the items to the item menu
        let quantityMap = {};
        items.forEach(item => {
          if (item.team === caster.team) {
            let existing = quantityMap[item.actionId];//check if the name of the items are same or not
            if (existing) { // if yes the quantity of the item is increased 
              existing.quantity += 1; 
            } else {
              quantityMap[item.actionId] = { // if not the new item is registered
                actionId: item.actionId,
                quantity: 1,
                instanceId: item.instanceId,
              }
           }
          }
        })
        this.items = Object.values(quantityMap);
        
    }

    //Different option avilable while battling to the player
    getPages(){
        // to go back to the main menu 
        const backOption={
            label:"Go Back",
                    description:"Return to previous page",
                    handler:()=>{
                        //do something when chosen..
                        this.keyboardMenu.setOptions(this.getPages().root)
                    }
        };

        return{
            root:[
                //choose different attack option
                {
                    label:"Attack",
                    description:"choose an attack",
                    handler:()=>{
                        //do something when chosen..
                        this.keyboardMenu.setOptions(this.getPages().attacks)
                    
                    }
                },
                //chooose differnt itmes to use
                {
                    label:"Items",
                    description:"Select Items",
                    handler:()=>{
                        //Go to items page...
                        this.keyboardMenu.setOptions(this.getPages().items)
                        
                    }
                },
                //swap between different healthy pizzas
                {
                    label:"Swap",
                    description:"Change to another pizza",
                    handler:()=>{
                        //see pizza options
                        this.keyboardMenu.setOptions(this.getPages().replacements)

                    }
                },

            ],
            //for player to decide what attack to use
            attacks:[
                ...this.caster.actions.map(key=>{
                    const action = Actions[key];
                    return{
                        label:action.name,
                        description:action.description,
                        handler:() =>{
                            this.menuSubmit(action)
                        }
                    }
                }),
                backOption
            ],
            //for items
            items: [
                ...this.items.map(item => {
                  const action = Actions[item.actionId];
                  return {
                    label: action.name,
                    description: action.description,
                    right: () => {
                      return "x"+item.quantity;
                    },
                    handler: () => {
                      this.menuSubmit(action, item.instanceId)
                    }
                  }
                }),
                backOption
              ],
              //replacement for team mates
              replacements:[
                  ...this.replacements.map(replacement=>{
                    return{
                        label: replacement.name,
                        description:replacement.description,
                        handler:() =>{
                            //pizzas ready to be swap
                            this.menuSubmitReplacement(replacement)
                        }
                    }
                  }),
                  backOption
              ],
        }
    }

    menuSubmitReplacement(replacement){
        //end our keyboard even
        this.keyboardMenu?.end();

        //complete battle event
        this.onComplete({
            replacement,
        })
    }
    
    menuSubmit(action, instanceId=null) { // isntanceId is to know which item we used in battle

        this.keyboardMenu?.end(); //end the keyboardMenu binding

        this.onComplete({
            action,
            //checking who to perfomr the action on 
            target: action.targetType === "friendly" ? this.caster : this.enemy,
            instanceId,
        })
    }

    //ememies attack ..
    decide() {
       Math.floor(Math.random() * window.Actions.length);
       this.menuSubmit(Actions[this.caster.actions[0]]);
    
    }

    showMenu (container){
        
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.main(container);
        this.keyboardMenu.setOptions(this.getPages().root);
    }

    main(container) {

        if(this.caster.isPlayerControlled){
            // show some UI
            this.showMenu(container); // for player to choose actions

        }else {
            this.decide(); // enemy attacks automatically
        }
    }

}