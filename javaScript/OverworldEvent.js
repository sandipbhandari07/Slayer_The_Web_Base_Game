class OverworldEvent {
    constructor({ map, event }) {
        this.map = map;
        this.event = event;
    }

    //for standing event
    stand(resolve) {
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
                map: this.map
            }, {
                type: "stand",
                direction: this.event.direction,
                time: this.event.time
            })
            // set up a handler to complete when a correct person is done standing, then resolve the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("PersonStandComplete", completeHandler);
    }

    //for walking event
    walk(resolve) {

        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction,
            retry: true
        })

        // set up a handler to complete when a correct person is done walking, then resolve the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("PersonWalkingComplete", completeHandler);

    }

    // to display text message
    textMessage(resolve) {

        // to make NPCs face the hero while talking
        if (this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero];
            obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
        }

        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve()
        })
        message.main(document.querySelector(".game-container"))
    }


    changeMap(resolve) {

        const sceneTransition = new SceneTransition();
        sceneTransition.main(document.querySelector(".game-container"), () => {
            this.map.overworld.startMap(window.OverworldMaps[this.event.map],{
                x:this.event.x,
                y:this.event.y,
                direction:this.event.direction,
            });
            resolve();

            sceneTransition.fadeOut(); // we can see the new map after fadeout
        })
    }


    //for Battle
    battle(resolve) {
        const battle = new Battle({
            enemy: Enemies[this.event.enemyId],
            onComplete: (didWin) => {
                resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE");
            }
        })
        battle.main(document.querySelector(".game-container"));
    }


    //for pause menu
    pause (resolve){
        
        this.map.isPaused=true; // pause the game

        // for menu
        const menu = new PauseMenu({
            progress:this.map.overworld.progress,
            onComplete:() =>{
                resolve();
                this.map.isPaused=false; //unpause the game
                this.map.overworld.startGameLoop();
            }
        });
        menu.main(document.querySelector(".game-container"));
        
    }


    //story flag to know which point in the game we are
    addStoryFlag(resolve){
        window.playerState.storyFlags[this.event.flag]=true;
        resolve();
    }

    //for crafting

    craftingMenu(resolve){
        const menu= new CraftingMenu({
            pizzas: this.event.pizzas,

            onComplete:() =>{
                resolve();
            }
        })
        menu.main(document.querySelector(".game-container"));
    }


    main() {
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }


}