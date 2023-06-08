class ReplacementMenu{
    constructor({replacements,onComplete}){
        this.replacements=replacements;
        this.onComplete=onComplete;

    }

        //Enemy replace the dead team member with if avilable
    decide(){
        this.menuSubmit(this.replacements[0])
    }


    menuSubmit(replacement){

        this.keyboardMenu?.end();
        this.onComplete(replacement);
    }

        //menu for player to replace the dead team member if avilable
    showMenu(container){
        this.keyboardMenu= new KeyboardMenu();
        this.keyboardMenu.main(container);
        this.keyboardMenu.setOptions(this.replacements.map(c=>{
            return{
                label: c.name,
                description: c.description,
                handler: ()=>{
                    this.menuSubmit(c);
                }
            }
        }))

    }
    main(container){
        if(this.replacements[0].isPlayerControlled){
        this.showMenu(container);
      }else{
          this.decide();
      }
    }
}