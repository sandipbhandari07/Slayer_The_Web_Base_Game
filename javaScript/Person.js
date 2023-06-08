class Person extends GameObject {
    constructor(config) {
        super(config);
        this.movingPogressRemaining = 0; // initial position
        this.isStanding = false;
        this.intentPosition = null; // [x,y]

        this.isPlayerControlled = config.isPlayerControlled || false; // it is false so we cannot control any unit

        this.directionUpdate = {
            "up": ["y", -1],
            "down": ["y", 1],
            "left": ["x", -1],
            "right": ["x", 1],

        }
        this.standBehaviorTimeout;
    }

    update(state) {
        if (this.movingPogressRemaining > 0) {
            this.updatePosition();
        } else {
            // more cases for walking 
            //case: we are keyboard ready and have an arrow pressed
            if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) { //move only after finishing moving 
                this.startBehavior(state, {
                    type: "walk",
                    direction: state.arrow

                })
            }
            this.updateSprite(state);
        }

    }

    startBehavior(state, behavior) {

        if (!this.isMounted) {
            return;
          }
      
        //set character direction 
        this.direction = behavior.direction; // taking arrow key 

        if (behavior.type === "walk") {

            //stop if space is not free
            if (state.map.isSpaceTaken(this.x, this.y, this.direction)) { // to check if the next sapce is take or not

                //to start walking agian after its path gets blocked
                behavior.retry && setTimeout(() => {
                    this.startBehavior(state, behavior)
                }, 10);
                return;
            }
            //ready to walk
           // state.map.moveWall(this.x, this.y, this.direction);
            this.movingPogressRemaining = 16; //reset the counter to 16 or grid size
            this.updateSprite(state); // update proper sprite so we get waking animation
        }


        //stand for the give time duration 
        if (behavior.type === "stand") {
            this.isStanding = true;
            setTimeout(() => {
                utils.emitEvent("PersonStandComplete", {
                    whoId: this.id
                })
                this.isStanding = false;
            }, behavior.time)
        }

    }

    updatePosition() {

        const [property, change] = this.directionUpdate[this.direction];
        this[property] += change;
        this.movingPogressRemaining -= 1; // will loop the animation back to the start of the array

        if (this.movingPogressRemaining === 0) {
            //fishish walking 
            utils.emitEvent("PersonWalkingComplete", {
                whoId: this.id
            })

        }
    }


    updateSprite() {
        if (this.movingPogressRemaining > 0) { // when arrow is pressed walking animation will be used 
            this.sprite.setAnimation("walk-" + this.direction);
            return;
        }
        this.sprite.setAnimation("idle-" + this.direction);

    }
}