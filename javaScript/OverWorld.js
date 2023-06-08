class Overworld {

    constructor(config) {
        this.element = config.element; // passing elemnt for the overworld to work on
        this.canvas = this.element.querySelector(".game-canvas"); // calling canvas tag
        this.ctx = this.canvas.getContext("2d"); // gets us assets to all the drawing method present in canvas
        this.map = null;
    }

    //refresh the screen every second
    startGameLoop() {
        const step = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clears the frame everytime it loads

            //Camara following the main character
            const cameraPerson = this.map.gameObjects.hero;


            // upadte all objects
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                })
            })



            //draw lower layer
            this.map.drawLowerImage(this.ctx, cameraPerson);

            //draw game Objects

            //sorting to display the correct sprite and draw them
            Object.values(this.map.gameObjects).sort((a, b) => {
                return a.y - b.y; // substracting the y value to display the correct sprite
            }).forEach(object => {

                object.sprite.draw(this.ctx, cameraPerson);
            })

            //draw upper layer
            this.map.drawUpperImage(this.ctx, cameraPerson);

            if(!this.map.isPaused){
            requestAnimationFrame(() => {
                step(); //calls step() when new frame starts 
            })
        }
        }
        step();
    }

    // check if he is talking to NPCs
    bindActionInput() {
        //adding event listener for enter key 
        new keyPressListener("Enter", () => {

            //Is there a person to talk to???
            this.map.checkForActionCutscene()
        })

        //adding event listener for Space key 
        new keyPressListener("Space", () => {

            //Is there a person to talk to???
            this.map.checkForActionCutscene()
        })

        //adding event listener for esc key

        new keyPressListener("Escape",()=>{
            if(!this.map.isCutscenePlaying){
                this.map.startCutscene([
                    {type:"pause"}
                ])
            }
        })
    }


    //check for heros positions
    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if (e.detail.whoId === "hero") {
                // heros positon has changed

                this.map.checkForFootstepCutscene()
            }
        })
    }


    startMap(mapConfig, heroInitialState=null) {
        this.map = new OverworldMap(mapConfig); // loading map
        this.map.overworld = this;
        this.map.mountObjects();

            //the followin will be overided when provided
            if (heroInitialState) {
                const {hero} = this.map.gameObjects;
                hero.x = heroInitialState.x;
                hero.y = heroInitialState.y;
                hero.direction = heroInitialState.direction;
              }
        
        //
        this.progress.mapId = mapConfig.id;
        this.progress.startingHeroX = this.map.gameObjects.hero.x;
        this.progress.startingHeroY = this.map.gameObjects.hero.y;
        this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
    }

    async main() {

        const container = document.querySelector(".game-container");

        //creating new progress tracker
        this.progress = new Progress();

        //show the title screen
        this.titleScreen=new TitleScreen({
            progress: this.progress
        })
       const useSaveFile= await this.titleScreen.main(container); 

        //checking for save data

        let initialHeroState =null;
        
        if(useSaveFile){
            this.progress.load();
            //position and the direction the hero is facing
            initialHeroState={
                x: this.progress.startingHeroX,
                y: this.progress.startingHeroY,
                direction:this.progress.startingHeroDirection,
            }
        }

        //loading the hud
        this.hud= new Hud();
        this.hud.main(container);

      //this.startMap(window.OverworldMaps.DemoRoom);
      // this.startMap(window.OverworldMaps.Kitchen);
      // this.startMap(window.OverworldMaps.DiningRoom);
     // this.startMap(window.OverworldMaps.GreenKitchen);
      //this.startMap(window.OverworldMaps.PizzaShop);
       //this.startMap(window.OverworldMaps.Street);
     //this.startMap(window.OverworldMaps.StreetNorth);
      

     //start the first map
     this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState );

     //Create controls
     this.bindActionInput();
     this.bindHeroPositionCheck();
   
     this.directionInput = new DirectionInput();
     this.directionInput.main();

     this.startGameLoop(); // starts this loop when the game starts

        //  this.map.startCutscene([
        // //     // { type: "battle" , enemyId:"beth" },
        // //     // { type: "changeMap", map: "DemoRoom" },

        // //     //  setting up event when cutscene triggers
        //  ])


    }












}