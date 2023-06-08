class Sprite {
    constructor(config) {

        //setting the image
        this.image = new Image();
        this.image.src = config.src;
        this.image.onload = () => {
            this.isLoaded = true; // will draw the image only if the value is true
        }


        //shadow
        this.shadow = new Image();
        this.useShadow = true; // config.useShadow || false
        if (this.useShadow) {
            this.shadow.src = "/images/characters/shadow.png"; // use shadow only if the value is true
        }
        this.shadow.onload = () => {
            this.isShadowLoaded = true;
        }



        //Configuring animation and initial state
        this.animations = config.animations || {
            //defaut animations 
            "idle-down": [
                [0, 0]
            ], 
            "idle-right": [
                [0, 1]
            ],
            "idle-up": [
                [0, 2]
            ],
            "idle-left": [
                [0, 3]
            ],
            // walking animation
            "walk-down": [
                [1, 0],
                [0, 0],
                [3, 0],
                [0, 0],
            ],
            "walk-right": [
                [1, 1],
                [0, 1],
                [3, 1],
                [0, 1],
            ],
            "walk-up": [
                [1, 2],
                [0, 2],
                [3, 2],
                [0, 2]
            ],
            "walk-left": [
                [1, 3],
                [0, 3],
                [3, 3],
                [0, 3],
            ]

        }
        this.currentAnimation = config.currentAnimation || "idle-down";
        this.currentAnimationFrame = 0;

        this.animationFrameLimit = config.animationFrameLimit || 8; //higher number slower the character and vice versa
        this.animatonFrameProgress = this.animationFrameLimit; // track time of animaton 


        //refrence the game object
        this.gameObject = config.gameObject;
    }

    get frame() {
        return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }

    setAnimation(key) {
        if (this.currentAnimation !== key) {
            this.currentAnimation = key;
            this.currentAnimationFrame = 0;
            this.animatonFrameProgress = this.animationFrameLimit;
        }
    }


    updateAnimationPogress() {
        //downtick frame pogress
        if (this.animatonFrameProgress > 0) {
            this.animatonFrameProgress -= 1;
            return;
        }

        //reset the counter
        this.animatonFrameProgress = this.animationFrameLimit;
        this.currentAnimationFrame += 1;

        if (this.frame == undefined) {
            this.currentAnimationFrame = 0;
        }

    }



    draw(ctx, cameraPerson) {
        const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x; //each square is 16*16
        const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y; //each square is 16*16

        this.isShadowLoaded && ctx.drawImage(this.shadow, x, y); 


        const [frameX, frameY] = this.frame;

        this.isLoaded && ctx.drawImage(this.image,
            frameX * 32, frameY * 32, // left and right cut
            32, 32, // size of the cut
            x, y,
            32, 32 // size of which it should be drawn
        )
        this.updateAnimationPogress();
    }
}