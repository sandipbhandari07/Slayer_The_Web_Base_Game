class GameObject {

    constructor(config) {
        this.id = null; // this value will be set when objects are created
        this.isMounted = false;
        this.x = config.x || 0; // starting position of a character in x axis
        this.y = config.y || 0; // starting position of a character in y axis
        this.direction = config.direction || "down";
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "/images/characters/people/hero.png", // sprites of the character 
        });

        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0; // to know or track which behavior we are on 
        this.talking = config.talking || []; // to see if some one is taking or not
        this.retryTimeout = null;
    }

    mount(map) { // adding objects to the scene
        this.isMounted = true;

        //if we have a behavior, kick off after a short delay
        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10)
    }


    update() {

    }


    async doBehaviorEvent(map) { // async is used for await keyword

        // dont do anything if there is cutscene

        if (this.behaviorLoop.length === 0) {
            return;  
          }

          if (map.isCutscenePlaying) {

           // console.log("will retry", this.id)
            if (this.retryTimeout) {
              clearTimeout(this.retryTimeout);
            }
            this.retryTimeout = setTimeout(() => {
              this.doBehaviorEvent(map);
            }, 1000)
            return;
          }

        //setting up our event
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id; // id  means hero or  npcs

        // create an event instance out of our next event 
        const eventHandler = new OverworldEvent({ map, event: eventConfig });

        await eventHandler.main(); // nothing below await line is gonna execute until this line finish executing


        // the code below executes after the above line finishes
        // and giving some time before the code below executes
        this.behaviorLoopIndex += 1;
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0;
        }


        // do it again
        this.doBehaviorEvent(map);
    }


}