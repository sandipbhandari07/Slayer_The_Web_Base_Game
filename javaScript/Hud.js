class Hud{
    constructor(){
        this.scoreboards=[];

    }
    //updating it with all the changes accored during the battle
    update(){
        this.scoreboards.forEach(s=>{
            s.update(window.playerState.pizzas[s.id])
        })

    }

        //creating hud for pizzas in the party
    createElement(){

        //clean the Hud
        if(this.element){
            this.element.remove(); // removing old element
            this.scoreboards=[]; // resetting the scoreboard to empty
        }

        this.element=document.createElement("div");
        this.element.classList.add("Hud");

        const{playerState} = window;
        playerState.lineup.forEach(key => {
            const pizza =playerState.pizzas[key];
            const scoreboard=new  Combatant({
                id:key,
                ...Pizzas[pizza.pizzaId],
                ...pizza,

            },null)
            scoreboard.createElement();
            this.scoreboards.push(scoreboard);
            this.element.appendChild(scoreboard.hudElement);
        
        })
        this.update();

    }

    main(container){
        this.createElement();
        container.appendChild(this.element);

        document.addEventListener("PlayerStateUpdated",() =>{
            this.update();
        })


        document.addEventListener("LineupChanged",()=>{
            this.createElement();
            container.appendChild(this.element);
        })
    }
}