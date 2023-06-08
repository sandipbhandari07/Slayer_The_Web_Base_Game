class OverworldMap {
    constructor(config) {

        this.overworld = null;
        this.gameObjects = {}; // Live objects are in here
        this.configObjects = config.configObjects; // Configuration content
    
        
        this.cutsceneSpaces = config.cutsceneSpaces || {};
        this.walls = config.walls || {};// object for walls
    
        this.lowerImage = new Image();// for images like floor, road ,grass etc
        this.lowerImage.src = config.lowerSrc;
    
        this.upperImage = new Image();// for images like roof, treetop etc
        this.upperImage.src = config.upperSrc;
    
        this.isCutscenePlaying = false;// for cutscenes
        this.isPaused = false;

    }
    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
          this.lowerImage, 
          utils.withGrid(10.5) - cameraPerson.x, 
          utils.withGrid(6) - cameraPerson.y
          )
      }
    
      drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
          this.upperImage, 
          utils.withGrid(10.5) - cameraPerson.x, 
          utils.withGrid(6) - cameraPerson.y
        )
      } 

    isSpaceTaken(currentX, currentY, direction) { //to check if we are against some kind of wall
        const {x,y} = utils.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }
    //Check for game objects at this position
    return Object.values(this.gameObjects).find(obj => {
      if (obj.x === x && obj.y === y) { return true; }
      if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y ) {
        return true;
      }
      return false;
    })
    }


    mountObjects() {
        Object.keys(this.configObjects).forEach(key => {
    
          let object = this.configObjects[key];
          object.id = key; // id means hero, npcs etc
    
          let instance;
          if (object.type === "Person") {
            instance = new Person(object);
          }
          if (object.type === "PizzaStone") {
            instance = new PizzaStone(object);
          }
          this.gameObjects[key] = instance;
          this.gameObjects[key].id = key;
          instance.mount(this);
        })
      }
    

    // Cut scene events
    async startCutscene(events) { // async executes the behaviour 1 by 1

        this.isCutscenePlaying = true; // true to play events

        //for events to play in order

        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this,
            })
           const result = await eventHandler.main(); //wait for each event to complete
           if(result ==="LOST_BATTLE"){
               break; // if the player looses the battle the cutscene breaks and wont move faward
           }
        }

        this.isCutscenePlaying = false;


        // reset NPC to do their idle behavior

       // Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
    }

    // check for action
    checkForActionCutscene() {
        const hero = this.gameObjects["hero"];
        //to see heroes position and where he is facing
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);

        //to check if the hero is interaction with the person or not
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
          });
      //  console.log({ match });
      if (!this.isCutscenePlaying && match && match.talking.length) {

        const relevantScenario = match.talking.find(scenario => {
          return (scenario.required || []).every(sf => {
            return playerState.storyFlags[sf]
          })
        })
            
        relevantScenario && this.startCutscene(relevantScenario.events) // defaulting to the first one we find
        }
    }

    // check for heor's footsteps

    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"];
        const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
        if (!this.isCutscenePlaying && match) {
            this.startCutscene(match[0].events) //defaulting to the first one we find
        }
    }
//     addWall(x, y) { // adding invisible wall
//         this.walls[`${x},${y}`] = true;
//     }
//     removeWall(x, y) { // removing invisible wall
//         delete this.walls[`${x},${y}`]
//     }
//     moveWall(wasX, wasY, direction) {
//         this.removeWall(wasX, wasY);
//         const { x, y } = utils.nextPosition(wasX, wasY, direction);
//         this.addWall(x, y);
//     }

 }


window.OverworldMaps = { //object of all the maps in the game

    //DemoRoom
    DemoRoom: {
        id:"DemoRoom",
        lowerSrc: "/images/maps/DemoLower.png",
        upperSrc: "/images/maps/DemoUpper.png",
            configObjects: {
                hero: {
                  type: "Person",
                  isPlayerControlled: true,// it is true cause we can control this unit
                  x: utils.withGrid(5),
                  y: utils.withGrid(6),
                },
                npcA: {
                    type: "Person",
                    x: utils.withGrid(10),
                    y: utils.withGrid(8),
                    src: "/images/characters/people/npc1.png",
                    behaviorLoop: [
                      { type: "walk", direction: "left", },
                      { type: "walk", direction: "down", },
                      { type: "walk", direction: "right", },
                      { type: "walk", direction: "up", },
                      { type: "stand", direction: "up", time: 400, },
                    ],
                    talking: [
                      {
                        required: ["TALKED_TO_ERIO"],
                        events: [
                          { type: "textMessage", text: "Isn't Erio the coolest?", faceHero: "npcA" },
                        ]
                      },
                      {
                        events: [
                          { type: "textMessage", text: "I'm going to crush you!", faceHero: "npcA" },
                          { type: "battle", enemyId: "beth" },
                          { type: "addStoryFlag", flag: "DEFEATED_BETH"},
                          { type: "textMessage", text: "You crushed me like weak pepper.", faceHero: "npcA" },
                          { type: "textMessage", text: "Go away!"},
                           //{ who: "npcB", type: "walk",  direction: "up" },
                        ]
                      }
                    ]
                  },
                  npcB: {
                    type: "Person",
                    x: utils.withGrid(8),
                    y: utils.withGrid(5),
                    src: "/images/characters/people/erio.png",
                    talking: [
                      {
                        events: [
                          { type: "textMessage", text: "Bahaha!", faceHero: "npcB" },
                          { type: "addStoryFlag", flag: "TALKED_TO_ERIO"}
                          //{ type: "battle", enemyId: "erio" }
                        ]
                      }
                    ],
                       behaviorLoop: [
                                { type: "stand", direction: "right", time: 1000 },
                                { type: "stand", direction: "down", time: 800 },
                                { type: "stand", direction: "left", time: 1200 },
                                { type: "stand", direction: "down", time: 1500 },
            
                            ]
                  },
                  npcC: {
                    type: "Person",
                    x: utils.withGrid(4),
                    y: utils.withGrid(8),
                    src: "/images/characters/people/npc1.png",
                    behaviorLoop: [
                      { type: "stand", direction: "left", time: 500, },
                      { type: "stand", direction: "down", time: 500, },
                      { type: "stand", direction: "right", time: 500, },
                      { type: "stand", direction: "up", time: 500, },
                      { type: "walk", direction: "left",  },
                      { type: "walk", direction: "down",  },
                      { type: "walk", direction: "right",  },
                      { type: "walk", direction: "up",  },
                    ],
                  },
           
                  pizzaStone: {
                    type: "PizzaStone",
                    x: utils.withGrid(2),
                    y: utils.withGrid(7),
                    storyFlag: "USED_PIZZA_STONE",
                    pizzas: ["v001", "f001"],
                  },
                },
        
        walls: {
            //for table
            [utils.asGridCoord(7, 6)]: true,
            [utils.asGridCoord(8, 6)]: true,
            [utils.asGridCoord(7, 7)]: true,
            [utils.asGridCoord(8, 7)]: true,
            //buttom wall
            [utils.asGridCoord(10,10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(5, 11)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(2, 10)]: true,
            [utils.asGridCoord(1, 10)]: true,
            //right wall
            [utils.asGridCoord(11, 9)]: true,
            [utils.asGridCoord(11, 8)]: true,
            [utils.asGridCoord(11, 7)]: true,
            [utils.asGridCoord(11, 6)]: true,
            [utils.asGridCoord(11, 5)]: true,
            [utils.asGridCoord(11, 4)]: true,
            //top wall
            [utils.asGridCoord(10, 3)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(8, 4)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(6, 4)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(1, 3)]: true,
            //left wall
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 4)]: true,    
        },

        //trigger the following cutscene if hero walk in certain coorindate 
        cutsceneSpaces: {
            [utils.asGridCoord(7, 4)]: [{
                events: [
                    { who: "npcB", type: "walk", direction: "left" },
                    { who: "npcB", type: "stand", direction: "up", time: 500 },
                    { type: "textMessage", text: "you can't go in there !!!!" },
                    { who: "npcB", type: "walk", direction: "right" },
                    { who: "hero", type: "walk", direction: "down" },
                    { who: "hero", type: "walk", direction: "left" },
                ]
            }],
            [utils.asGridCoord(5, 10)]: [{
                events: [
                    { type: "changeMap", 
                    map: "Street",
                    x: utils.withGrid(5),
                    y: utils.withGrid(9),
                    direction:"down"
                },
                ]
            }]
        
        },
    },
    
    //Kitchen
    Kitchen: {
        id:"Kitchen",
        lowerSrc: "/images/maps/KitchenLower.png",
        upperSrc: "/images/maps/KitchenUpper.png",

            configObjects: {
                hero: {
                  type: "Person",
                  isPlayerControlled: true,
                  x: utils.withGrid(10),
                  y: utils.withGrid(5),
                
                },
                  kitchenNpcA: {
                    type: "Person",
                    x: utils.withGrid(9),
                    y: utils.withGrid(5),
                    direction: "up",
                    src: "/images/characters/people/npc8.png",
                    talking: [
                      {
                        events: [
                          { type: "textMessage", text: "** They don't want to talk to you **",},
                        ]
                      }
                    ]
                  },
                  kitchenNpcB: {
                    type: "Person",
                    x: utils.withGrid(3),
                    y: utils.withGrid(6),
                    src: "/images/characters/people/npc3.png",
                    talking: [
                      {
                        events: [
                          { type: "textMessage", text: "People take their jobs here very seriously.", faceHero: "kitchenNpcB" },
                        ]
                      }
                    ],
                    behaviorLoop: [
                     
                      { type: "stand", direction: "up", time: 500 },
                      { type: "stand", direction: "left", time: 500 },
                    ]
                  },
                },
        
        walls: {
            //for table
        
            [utils.asGridCoord(7, 7)]: true,
            [utils.asGridCoord(6, 7)]: true,
            [utils.asGridCoord(9, 7)]: true,
            [utils.asGridCoord(10, 7)]: true,
            [utils.asGridCoord(9, 9)]: true,
            [utils.asGridCoord(10, 9)]: true,
            //buttom wall
            [utils.asGridCoord(12,10)]: true,
            [utils.asGridCoord(11,10)]: true,
            [utils.asGridCoord(10,10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(5, 11)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(2, 9)]: true,
            [utils.asGridCoord(1, 9)]: true,
            //right wall
            [utils.asGridCoord(13, 9)]: true,
            [utils.asGridCoord(13, 8)]: true,
            [utils.asGridCoord(13, 7)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(13, 5)]: true,
            [utils.asGridCoord(13, 4)]: true,
            //top wall
            [utils.asGridCoord(12, 4)]: true,
            [utils.asGridCoord(11, 4)]: true,
            [utils.asGridCoord(10, 3)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(8, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(1, 3)]: true,
        
            //left wall
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(1, 5)]: true,
            [utils.asGridCoord(0, 4)]: true,
            
           
        },
              //trigger the following cutscene if hero walk in certain coorindate 
              cutsceneSpaces: {
        
                [utils.asGridCoord(5, 10)]: [{
                    events: [
                        { type: "changeMap",
                        map: "DiningRoom",
                        x: utils.withGrid(7),
                        y: utils.withGrid(3),
                        direction: "down"
                    },
                    ]
                }],
            
                [utils.asGridCoord(10,6)]: [{
                    disqualify: ["SEEN_INTRO"],
                    events: [
                      { type: "addStoryFlag", flag: "SEEN_INTRO"},
                      { type: "textMessage", text: "* You are chopping ingredients on your first day as a Pizza Chef at a famed establishment in town. *"},
                      { type: "walk", who: "kitchenNpcA", direction: "down"},
                      { type: "stand", who: "kitchenNpcA", direction: "right", time: 200},
                      { type: "stand", who: "hero", direction: "left", time: 200},
                      { type: "textMessage", text: "We have an emergency?"},
                      { type: "textMessage", text: "The SECRET RECIPE has been stollen ! "},
                      { type: "textMessage", text: "I want you to search for it, since you are my one and only pupil"},
                      { type: "textMessage", text: "Find it so I can provide you with the ancient recipe..!"},
                      { type: "stand", who: "kitchenNpcA", direction: "right", time: 200},
                      { type: "walk", who: "kitchenNpcA", direction: "up"},
                      { type: "stand", who: "kitchenNpcA", direction: "up", time: 300},
                      { type: "stand", who: "hero", direction: "down", time: 400},
                      { type: "textMessage", text: "* The journy is hard ! You should level up your Pizza lineup and skills. *"},
                      {
                        type: "changeMap",
                        map: "Street",
                        x: utils.withGrid(5),
                        y: utils.withGrid(10),
                        direction: "down"
                      },
                    ]
                  }]
        },
    },

     //Street
     Street: {
         id:"Street",
        lowerSrc: "/images/maps/StreetLower.png",
        upperSrc: "/images/maps/StreetUpper.png",
        configObjects: {
            hero: {
              type: "Person",
              isPlayerControlled: true,
              x: utils.withGrid(30),
              y: utils.withGrid(10),
            },
            streetNpcA: {
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(11),
                src: "/images/characters/people/npc2.png",
                behaviorLoop: [
                  { type: "stand", direction: "up", time: 900, },
                  { type: "walk", direction: "down"},
                  { type: "walk", direction: "down"},
                  { type: "stand", direction: "right", time: 800, },
                  { type: "stand", direction: "down", time: 400, },
                  { type: "stand", direction: "right", time: 800, },
                  { type: "walk", direction: "up"},
                  { type: "walk", direction: "up"},
                  { type: "stand", direction: "up", time: 600, },
                  { type: "stand", direction: "right", time: 900, },
                ],
                talking: [
                  {
                    events: [
                      { type: "textMessage", text: "I heard someone is stealing the secret recipe from all famous pizza school.", faceHero: "streetNpcA" },
                    ]
                  }
                ]
              },
              streetNpcB: {
                type: "Person",
              
                x: utils.withGrid(25),
                y: utils.withGrid(12),
                src: "/images/characters/people/npc7.png",
                behaviorLoop: [
                  { type: "stand", direction: "up", time: 400, },
                  { type: "stand", direction: "left", time: 800, },
                  { type: "stand", direction: "down", time: 400, },
                  { type: "stand", direction: "left", time: 800, },
                  { type: "stand", direction: "right", time: 800, },
                ],
                talking: [
                  {
                    events: [
                      { type: "textMessage", text: "that man over there looks suspicious, and that scares me.", faceHero: "streetNpcB" },
                    ]
                  }
                ]
              },
              streetNpcC: { 
                type: "Person",
                x: utils.withGrid(22),
                y: utils.withGrid(10),
                src: "/images/characters/people/npc8.png",
                behaviorLoop: [
                   
                    { type: "stand", direction: "up", time: 600, },
                    { type: "stand", direction: "left", time: 1000, },
                    { type: "stand", direction: "down", time: 500, },
                    { type: "stand", direction: "left", time: 800, },
                    { type: "stand", direction: "right", time: 700, },
                  ],
                talking: [
                  {
                    required: ["streetBattle"],
                    events: [
                      { type: "textMessage", text: "You are quite capable.", faceHero: "streetNpcC" },
                      { type: "textMessage", text: "But you are still no match for my leader", faceHero: "streetNpcC" },
                    
                    ]
                  },
                  {
                    events: [
                      { type: "textMessage", text: "You should have just stayed home!", faceHero: "streetNpcC" },
                      { type: "battle", enemyId: "streetBattle" },
                      { type: "addStoryFlag", flag: "streetBattle"},
                     
                    ]
                  }
                ]
              },

              streetNpcD: {
                type: "Person",
              
                x: utils.withGrid(13),
                y: utils.withGrid(10),
                src: "/images/characters/people/npc5.png",
                behaviorLoop: [
                    { type: "stand", direction: "right", },
                  
                 
                ],
                talking: [
                  {
                    events: [
                      { type: "textMessage", text: "Had to close the shop due to those thives.", faceHero: "streetNpcD" },
                    ]
                  }
                ]
              },

              streetNpcE:  {
                type: "Person",
              
                x: utils.withGrid(14),
                y: utils.withGrid(10),
                src: "/images/characters/people/npc5.png",
                behaviorLoop: [
                    
                    { type: "stand", direction: "left",},
                    
              
                ],
                talking: [
                  {
                    events: [
                      { type: "textMessage", text: "If only I find those thives ", faceHero: "streetNpcE" },
                    ]
                  }
                ]
              },
              
        },
        walls: {
            //for garden
            [utils.asGridCoord(18, 11)]: true,
            [utils.asGridCoord(19, 11)]: true,
            [utils.asGridCoord(17, 11)]: true,
            [utils.asGridCoord(17, 10)]: true,
            [utils.asGridCoord(17, 9)]: true,
            [utils.asGridCoord(16, 11)]: true,
            [utils.asGridCoord(16, 10)]: true,
            [utils.asGridCoord(16, 9)]: true,
            [utils.asGridCoord(25, 11)]: true,
            [utils.asGridCoord(25, 10)]: true,
            [utils.asGridCoord(25, 9)]: true,
            [utils.asGridCoord(26, 11)]: true,
            [utils.asGridCoord(26, 10)]: true,
            [utils.asGridCoord(26, 9)]: true,
            //buttom wall
            [utils.asGridCoord(33,14)]: true,
            [utils.asGridCoord(32, 14)]: true,
            [utils.asGridCoord(31, 14)]: true,
            [utils.asGridCoord(30, 14)]: true,
            [utils.asGridCoord(29, 14)]: true,
            [utils.asGridCoord(28, 14)]: true,
            [utils.asGridCoord(27, 14)]: true,
            [utils.asGridCoord(26, 14)]: true,
            [utils.asGridCoord(25, 14)]: true,
            [utils.asGridCoord(24, 14)]: true,
            [utils.asGridCoord(23, 14)]: true,
            [utils.asGridCoord(22, 14)]: true,
            [utils.asGridCoord(21, 14)]: true,
            [utils.asGridCoord(20, 14)]: true,
            [utils.asGridCoord(19, 14)]: true,
            [utils.asGridCoord(18, 14)]: true,
            [utils.asGridCoord(17, 14)]: true,
            [utils.asGridCoord(16, 14)]: true,
            [utils.asGridCoord(15, 14)]: true,
            [utils.asGridCoord(14, 14)]: true,
            [utils.asGridCoord(13, 14)]: true,
            [utils.asGridCoord(12, 14)]: true,
            [utils.asGridCoord(11, 14)]: true,
            [utils.asGridCoord(10, 14)]: true,
            [utils.asGridCoord(9, 14)]: true,
            [utils.asGridCoord(8, 14)]: true,
            [utils.asGridCoord(7, 14)]: true,
            [utils.asGridCoord(6, 14)]: true,
            [utils.asGridCoord(5, 14)]: true,
            [utils.asGridCoord(4, 14)]: true,
           
            //right wall
            [utils.asGridCoord(34,13)]: true,
            [utils.asGridCoord(34,12)]: true,
            [utils.asGridCoord(34,11)]: true,
            [utils.asGridCoord(34,10)]: true,

            //top wall
            [utils.asGridCoord(33,9)]: true,
            [utils.asGridCoord(32,9)]: true,
            [utils.asGridCoord(31,9)]: true,
            [utils.asGridCoord(30,9)]: true,
            [utils.asGridCoord(29,8)]: true,
            [utils.asGridCoord(28,9)]: true, //door co-ordinate
            [utils.asGridCoord(28,8)]: true,
            [utils.asGridCoord(27,7)]: true,
            [utils.asGridCoord(26,7)]: true,
            [utils.asGridCoord(26,6)]: true,
            [utils.asGridCoord(26,5)]: true,
            [utils.asGridCoord(25,4)]: true,
            [utils.asGridCoord(24,5)]: true,
            [utils.asGridCoord(24,6)]: true,
            [utils.asGridCoord(24,7)]: true,
            [utils.asGridCoord(23,7)]: true, 
            [utils.asGridCoord(22,7)]: true,
            [utils.asGridCoord(21,7)]: true,
            [utils.asGridCoord(20,7)]: true,
            [utils.asGridCoord(19,7)]: true,
            [utils.asGridCoord(18,7)]: true,
            [utils.asGridCoord(17,7)]: true,
            [utils.asGridCoord(16,7)]: true,
            [utils.asGridCoord(15,7)]: true,
            [utils.asGridCoord(14,8)]: true,
            [utils.asGridCoord(13,8)]: true,
            [utils.asGridCoord(12,9)]: true,
            [utils.asGridCoord(11,9)]: true,
            [utils.asGridCoord(10,9)]: true,
            [utils.asGridCoord(9,9)]: true,
            [utils.asGridCoord(8,9)]: true,
            [utils.asGridCoord(7,9)]: true,
            [utils.asGridCoord(6,9)]: true,
            [utils.asGridCoord(5,8)]: true,//door co-ordinate
            [utils.asGridCoord(4,9)]: true,

            //left wall
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(3, 11)]: true,
            [utils.asGridCoord(3, 12)]: true,
            [utils.asGridCoord(3, 13)]: true,
            [utils.asGridCoord(3, 14)]: true,
            [utils.asGridCoord(3, 15)]: true,    
        },
            
             //trigger the following cutscene if hero walk in certain coorindate 
        cutsceneSpaces: {
        
            [utils.asGridCoord(29, 9)]: [{
                events: [
                    { type: "changeMap",
                     map: "PizzaShop",
                    x: utils.withGrid(5),
                    y: utils.withGrid(12),
                    direction:"up"
                },
                ]
            }],
            [utils.asGridCoord(5,9)]: [{
                events: [
                    { type: "changeMap",
                     map: "DiningRoom",
                    x: utils.withGrid(6),
                    y: utils.withGrid(12),
                    direction:"up"
                },
                ]
            }],
            [utils.asGridCoord(25,5)]: [{
                events: [
                    { type: "changeMap",
                     map: "StreetNorth",
                    x: utils.withGrid(7),
                    y: utils.withGrid(16),
                    direction:"up"
                },
                ]
            }],
        

    },
    },

    //DiningRoom
    DiningRoom: {
        id:"DiningRoom",
        lowerSrc: "/images/maps/DiningRoomLower.png",
        upperSrc: "/images/maps/DiningRoomUpper.png",
        configObjects: {
            hero: {
              type: "Person",
              isPlayerControlled: true,
              x: utils.withGrid(5),
              y: utils.withGrid(8),
            },
            diningRoomNpcA: {
              type: "Person",
              x: utils.withGrid(12),
              y: utils.withGrid(10),
              src: "/images/characters/people/npc8.png",
              talking: [
                {
                  required: ["diningRoomBattle"],
                  events: [
                    { type: "textMessage", text: "You may be strong but you cannot stop us.", faceHero: "diningRoomNpcA" },
                  ]
                },
                {
                  events: [
                    { type: "textMessage", text: "HAHAHAHHA...!", faceHero: "diningRoomNpcA" },
                    { type: "battle", enemyId: "diningRoomBattle", arena: "dining-room" },
                    { type: "addStoryFlag", flag: "diningRoomBattle"},
                  ]
                },
              ]
            },
            diningRoomNpcB: {
              type: "Person",
              x: utils.withGrid(9),
              y: utils.withGrid(5),
              src: "/images/characters/people/npc4.png",
              talking: [
                {
                  events: [
                    { type: "textMessage", text: "You must get back our recipe fast.", faceHero: "diningRoomNpcB" },
                  ]
                },
              ]
            },
            diningRoomNpcC: {
              type: "Person",
              x: utils.withGrid(2),
              y: utils.withGrid(8),
              src: "/images/characters/people/npc7.png",
              behaviorLoop: [
                { type: "stand", direction: "up", time: 900, },
      
                { type: "walk", direction: "down"},
                { type: "stand", direction: "right", time: 800, },
                { type: "stand", direction: "down", time: 400, },
                { type: "stand", direction: "right", time: 800, },
                { type: "walk", direction: "up"},
                { type: "stand", direction: "up", time: 600, },
                { type: "stand", direction: "right", time: 900, },
              ],
              talking: [
                {
                  events: [
                    { type: "textMessage", text: "I was so lucky to score a reservation!", faceHero: "diningRoomNpcC" },
                  ]
                },
              ]
            },
            diningRoomNpcD: {
              type: "Person",
              x: utils.withGrid(8),
              y: utils.withGrid(9),
              src: "/images/characters/people/npc1.png",
              behaviorLoop: [
                { type: "stand", direction: "right", time: 1200, },
                { type: "stand", direction: "down", time: 900, },
                { type: "stand", direction: "left", time: 800, },
                { type: "stand", direction: "down", time: 700, },
                { type: "stand", direction: "right", time: 400, },
                { type: "stand", direction: "up", time: 800, },
              ],
              talking: [
                {
                  events: [
                    { type: "textMessage", text: "I've been dreaming of this pizza for weeks!", faceHero: "diningRoomNpcD" },
                  ]
                },
              ]
            },
          },
          cutsceneSpaces: {
            [utils.asGridCoord(7,3)]: [
              {
                events: [
                  {
                    type: "changeMap",
                    map: "Kitchen",
                    x: utils.withGrid(5),
                    y: utils.withGrid(10),
                    direction: "up"
                  }
                ]
              }
            ],
            [utils.asGridCoord(6,12)]: [
              {
                events: [
                  {
                    type: "changeMap",
                    map: "Street",
                    x: utils.withGrid(5),
                    y: utils.withGrid(9),
                    direction: "down"
                  }
                ]
              }
            ],
          },
          walls: {
            [utils.asGridCoord(6,3)]: true,
            [utils.asGridCoord(7,2)]: true,
            [utils.asGridCoord(6,13)]: true,
            [utils.asGridCoord(1,5)]: true,
            [utils.asGridCoord(2,5)]: true,
            [utils.asGridCoord(3,5)]: true,
            [utils.asGridCoord(4,5)]: true,
            [utils.asGridCoord(4,4)]: true,
            [utils.asGridCoord(5,3)]: true,
            [utils.asGridCoord(6,4)]: true,
            [utils.asGridCoord(6,5)]: true,
            [utils.asGridCoord(8,3)]: true,
            [utils.asGridCoord(9,4)]: true,
            [utils.asGridCoord(10,5)]: true,
            [utils.asGridCoord(11,5)]: true,
            [utils.asGridCoord(12,5)]: true,
            [utils.asGridCoord(11,7)]: true,
            [utils.asGridCoord(12,7)]: true,
            [utils.asGridCoord(2,7)]: true,
            [utils.asGridCoord(3,7)]: true,
            [utils.asGridCoord(4,7)]: true,
            [utils.asGridCoord(7,7)]: true,
            [utils.asGridCoord(8,7)]: true,
            [utils.asGridCoord(9,7)]: true,
            [utils.asGridCoord(2,10)]: true,
            [utils.asGridCoord(3,10)]: true,
            [utils.asGridCoord(4,10)]: true,
            [utils.asGridCoord(7,10)]: true,
            [utils.asGridCoord(8,10)]: true,
            [utils.asGridCoord(9,10)]: true,
            [utils.asGridCoord(1,12)]: true,
            [utils.asGridCoord(2,12)]: true,
            [utils.asGridCoord(3,12)]: true,
            [utils.asGridCoord(4,12)]: true,
            [utils.asGridCoord(5,12)]: true,
            [utils.asGridCoord(7,12)]: true,
            [utils.asGridCoord(8,12)]: true,
            [utils.asGridCoord(9,12)]: true,
            [utils.asGridCoord(10,12)]: true,
            [utils.asGridCoord(11,12)]: true,
            [utils.asGridCoord(12,12)]: true,
            [utils.asGridCoord(0,4)]: true,
            [utils.asGridCoord(0,5)]: true,
            [utils.asGridCoord(0,6)]: true,
            [utils.asGridCoord(0,8)]: true,
            [utils.asGridCoord(0,9)]: true,
            [utils.asGridCoord(0,10)]: true,
            [utils.asGridCoord(0,11)]: true,
            [utils.asGridCoord(13,4)]: true,
            [utils.asGridCoord(13,5)]: true,
            [utils.asGridCoord(13,6)]: true,
            [utils.asGridCoord(13,8)]: true,
            [utils.asGridCoord(13,9)]: true,
            [utils.asGridCoord(13,10)]: true,
            [utils.asGridCoord(13,11)]: true,
          },
        },
   
    //PizzaShop
    PizzaShop: {
        id:"PizzaShop",
        lowerSrc: "/images/maps/PizzaShopLower.png",
        upperSrc: "/images/maps/PizzaShopUpper.png",
        configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(7),
      },

            shopNpcA: {
                type: "Person",
                x: utils.withGrid(6),
                y: utils.withGrid(5),
                src: "/images/characters/people/erio.png",
                talking: [
                  {
                    events: [
                      { type: "textMessage", text: "All of our INGREDIENTS has been stollen too....", faceHero: "shopNpcA" },
                        ]
                    },
                   
                ]
            },
            shopNpcB: {
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(8),
                src: "/images/characters/people/npc2.png",
                behaviorLoop: [
                  { type: "stand", direction: "left", time: 400, },
                  {type:"walk", direction:"down"},
                  { type: "stand", direction: "left", time: 400, },
                  {type:"walk", direction:"down"},
                  { type: "stand", direction: "left", time: 400, },
                  {type:"walk", direction:"up"}, 
                  { type: "stand", direction: "left", time: 400, },
                  {type:"walk", direction:"up"}, 
                ],
                talking: [
                  {
                    events: [
                      { type: "textMessage", text: "There is nothing left ...", faceHero: "shopNpcB" },
                        ]
                    },
                   
                ]
            },
            shopNpcC:{
                type: "Person",
              
                    x: utils.withGrid(1),
                    y: utils.withGrid(6),
                    src: "/images/characters/people/npc3.png",
                    behaviorLoop: [
                        { type: "stand", direction: "left", time: 1000, },
                        { type: "stand", direction: "down", time: 500, },
                        { type: "stand", direction: "left", time: 800, },
                        { type: "stand", direction: "right", time: 700, },
                      ],
                    talking: [
                      {
                        required: ["freePizza"],
                        events: [
                            
                          { type: "textMessage", text: "Please defeat the bad guys", faceHero: "shopNpcC" },   
                          
                        ]
                      },
                      {
                        events: [
                          { type: "textMessage", text: "only this pizza is left, You can take it", faceHero: "shopNpcC" },
                          { type: "addStoryFlag", flag: "freePizza"},
                          { who: "hero", type: "walk", direction: "down" },
                            { who: "hero", type: "stand", direction: "up" },
                            { who: "shopNpcC", type: "walk", direction: "down" },
                            { who: "shopNpcC", type: "walk", direction: "right" },
                         
                        ]
                      }
                    ]
                  
            },
            pizzaStone: {
                type: "PizzaStone",
                x: utils.withGrid(1),
                y: utils.withGrid(4),
                storyFlag: "STONE_SHOP",
                pizzas: ["v002", "f002"],
              },
   
    },
    walls: {
        //for table
        [utils.asGridCoord(3, 10)]: true,
        [utils.asGridCoord(3, 9)]: true,
        [utils.asGridCoord(3, 8)]: true,
        [utils.asGridCoord(4, 10)]: true,
        [utils.asGridCoord(4, 9)]: true,
        [utils.asGridCoord(4, 8)]: true,
        [utils.asGridCoord(7, 9)]: true,
        [utils.asGridCoord(7, 8)]: true,
        [utils.asGridCoord(8, 9)]: true,
        [utils.asGridCoord(8, 8)]: true,

        //for counter
        [utils.asGridCoord(9, 4)]: true,
        [utils.asGridCoord(9, 5)]: true,
        [utils.asGridCoord(9, 6)]: true,
        [utils.asGridCoord(8, 6)]: true,
        [utils.asGridCoord(7, 6)]: true,
        [utils.asGridCoord(5, 6)]: true,
        [utils.asGridCoord(4, 6)]: true,
        [utils.asGridCoord(3, 6)]: true,
        [utils.asGridCoord(2, 6)]: true,
        [utils.asGridCoord(2, 5)]: true,
        [utils.asGridCoord(2, 4)]: true,
        //buttom wall
        [utils.asGridCoord(10,12)]: true,
        [utils.asGridCoord(9, 12)]: true,
        [utils.asGridCoord(8, 12)]: true,
        [utils.asGridCoord(7, 12)]: true,
        [utils.asGridCoord(6, 12)]: true,
        [utils.asGridCoord(5, 13)]: true,
        [utils.asGridCoord(4, 12)]: true,
        [utils.asGridCoord(3, 12)]: true,
        [utils.asGridCoord(2, 12)]: true,
        [utils.asGridCoord(1, 12)]: true,
        //right wall
        [utils.asGridCoord(11, 12)]: true,
        [utils.asGridCoord(11, 11)]: true,
        [utils.asGridCoord(11, 10)]: true,
        [utils.asGridCoord(11, 9)]: true,
        [utils.asGridCoord(11, 8)]: true,
        [utils.asGridCoord(11, 7)]: true,
        [utils.asGridCoord(11, 6)]: true,
        [utils.asGridCoord(11, 5)]: true,
        [utils.asGridCoord(11, 4)]: true,
        //top wall
        [utils.asGridCoord(10, 3)]: true,
        [utils.asGridCoord(8, 3)]: true,
        [utils.asGridCoord(7, 3)]: true,
        [utils.asGridCoord(6, 3)]: true,
        [utils.asGridCoord(5, 3)]: true,
        [utils.asGridCoord(4, 3)]: true,
        [utils.asGridCoord(3, 3)]: true,
        [utils.asGridCoord(1, 3)]: true,
        //left wall
        [utils.asGridCoord(0, 11)]: true,
        [utils.asGridCoord(0, 10)]: true,
        [utils.asGridCoord(0, 9)]: true,
        [utils.asGridCoord(0, 8)]: true,
        [utils.asGridCoord(0, 7)]: true,
        [utils.asGridCoord(0, 6)]: true,
        [utils.asGridCoord(0, 5)]: true,
        [utils.asGridCoord(0, 4)]: true,    
    },
    cutsceneSpaces: {
    [utils.asGridCoord(5, 12)]: [{
        events: [
            { type: "changeMap",
             map: "Street",
            x: utils.withGrid(29),
            y: utils.withGrid(9),
            direction:"down"
        },
        ]
    }]
    },
    },

    //StreetNorth
    StreetNorth: {
        id:"StreetNorth",
        lowerSrc: "/images/maps/StreetNorthLower.png",
        upperSrc: "/images/maps/StreetNorthUpper.png",
        configObjects: {

            hero:  {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(5),
            },
            SNNpcA: {
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(6),
                src: "/images/characters/people/npc1.png",
                behaviorLoop: [
                  { type: "walk", direction: "left", },
                  { type: "walk", direction: "down", },
                  { type: "walk", direction: "right", },
                  { type: "stand", direction: "right", time: 800, },
                  { type: "walk", direction: "up", },
                  { type: "stand", direction: "up", time: 400, },
                ],
                talking: [
                  {
                    events: [
                      { type: "textMessage", text: "This place is famous for veggie pizzas!", faceHero: "SNNpcA" },
                    ]
                  }
                ]
            },
            
            SNNpcB:  {
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(6),
                src: "/images/characters/people/npc4.png",
                behaviorLoop: [
                  { type: "stand", direction: "left", time: 800, },
                  { type: "stand", direction: "down", time: 400, },
                  { type: "stand", direction: "left", time: 800, },
                  { type: "stand", direction: "right", time: 800, },
                ],
                talking: [
                  {
                    events: [
                      { type: "textMessage", text: "The pizza store might close if this continue.", faceHero: "SNNpcB" },
                    ]
                  }
                ]
            },

            SNNpcC:  {
                type: "Person",
                x: utils.withGrid(12),
                y: utils.withGrid(9),
                src: "/images/characters/people/npc8.png",
                behaviorLoop: [
                  { type: "stand", direction: "up", time: 400, },
                  { type: "stand", direction: "left", time: 800, },
                  { type: "stand", direction: "down", time: 400, },
                  { type: "stand", direction: "left", time: 800, },
                  { type: "stand", direction: "right", time: 800, },
                ],
                talking: [
                    {
                      required: ["streetNorthBattle"],
                      events: [
                        { type: "textMessage", text: "Could you be the Legendary one?", faceHero: "streetNorthNpcC" },
                      ]
                    },
                    {
                      events: [
                        { type: "textMessage", text: "you must be the one who beat my friend!", faceHero: "SNNpcC" },
                        { type: "battle", enemyId: "streetNorthBattle" },
                        { type: "addStoryFlag", flag: "streetNorthBattle"},
                    ]
                  }
                ]
            },

    },
    walls: {
        //buttom wall
        [utils.asGridCoord(2, 15)]: true,
        [utils.asGridCoord(3, 15)]: true,
        [utils.asGridCoord(4, 15)]: true,
        [utils.asGridCoord(5, 15)]: true,
        [utils.asGridCoord(6, 15)]: true,
        [utils.asGridCoord(6, 16)]: true,
        [utils.asGridCoord(7, 17)]: true,
        [utils.asGridCoord(8, 16)]: true,
        [utils.asGridCoord(8, 15)]: true,
        [utils.asGridCoord(9, 15)]: true,
        [utils.asGridCoord(10, 15)]: true,
        [utils.asGridCoord(11, 15)]: true,
        [utils.asGridCoord(12, 15)]: true,
        [utils.asGridCoord(13, 15)]: true,

        //right wall
        [utils.asGridCoord(14, 14)]: true,
        [utils.asGridCoord(14, 13)]: true,
        [utils.asGridCoord(14, 12)]: true,
        [utils.asGridCoord(14, 11)]: true,
        [utils.asGridCoord(14, 10)]: true,
        [utils.asGridCoord(14, 9)]: true,
        [utils.asGridCoord(14, 8)]: true,
        [utils.asGridCoord(14, 7)]: true,

        //top wall
        [utils.asGridCoord(13, 6)]: true,
        [utils.asGridCoord(12, 6)]: true,
        [utils.asGridCoord(11, 6)]: true,
        [utils.asGridCoord(10, 5)]: true,
        [utils.asGridCoord(9, 5)]: true,
        [utils.asGridCoord(8, 5)]: true,
        [utils.asGridCoord(7, 4)]: true,
        [utils.asGridCoord(6, 5)]: true,
        [utils.asGridCoord(5, 5)]: true, //put npc here
        [utils.asGridCoord(4, 5)]: true,
        [utils.asGridCoord(3, 6)]: true,
        [utils.asGridCoord(3, 7)]: true,
        [utils.asGridCoord(2, 7)]: true,

        //left wall
        [utils.asGridCoord(1, 8)]: true,
        [utils.asGridCoord(1, 9)]: true,
        [utils.asGridCoord(1, 10)]: true,
        [utils.asGridCoord(1, 11)]: true,
        [utils.asGridCoord(1, 12)]: true,
        [utils.asGridCoord(1, 13)]: true,
        [utils.asGridCoord(1, 14)]: true,


        //middle gardne
        [utils.asGridCoord(7, 10)]: true,
        [utils.asGridCoord(7, 9)]: true,
        [utils.asGridCoord(7, 8)]: true,
        [utils.asGridCoord(8, 10)]: true,
        [utils.asGridCoord(8, 9)]: true,
        [utils.asGridCoord(8, 8)]: true,
        [utils.asGridCoord(9, 10)]: true,
        [utils.asGridCoord(10, 10)]: true,


    },
              //trigger the following cutscene if hero walk in certain coorindate 
              cutsceneSpaces: {
        
                [utils.asGridCoord(7, 16)]: [{
                    events: [
                        { type: "changeMap",
                         map: "Street",
                        x: utils.withGrid(25),
                        y: utils.withGrid(5),
                        direction:"down"
                    },
                    ]
                }],
                [utils.asGridCoord(7, 5)]: [{
                    events: [
                        { type: "changeMap",
                         map: "GreenKitchen",
                        x: utils.withGrid(5),
                        y: utils.withGrid(12),
                        direction:"up"
                    },
                    ]
                }],
        },
    },
    
    //GreenKitchen
    GreenKitchen: {
        id:"GreenKitchen",
        lowerSrc: "/images/maps/GreenKitchenLower.png",
        upperSrc: "/images/maps/GreenKitchenUpper.png",
        configObjects: {

            hero:  {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(12),
            },
            npcA:  {
                type: "Person",
                x: utils.withGrid(3),
                y: utils.withGrid(5),
                src: "/images/characters/people/npc4.png",
                talking: [{
                    events: [
                        { type: "textMessage", text: "Since the SECRET RECIPE has be stolen, there are less customers. ", faceHero: "npcA" },
                        { type: "textMessage", text: "You are Chef's student right, please get the bad guys !", faceHero: "npcA" },
                    ]
                },
              

            ],
            behaviorLoop: [
                    
                    { type: "stand", direction: "right", time: 1000 },
                    { type: "stand", direction: "down", time: 800 },
                    { type: "stand", direction: "left", time: 1200 },
                    { type: "stand", direction: "down", time: 1500 },
          
             ],
              
            },

            npcB:  {
                type: "Person",
                x: utils.withGrid(3),
                y: utils.withGrid(8),
                src: "/images/characters/people/npc3.png",
                talking: [{
                    events: [
                        { type: "textMessage", text: "do not disturbe me  !", faceHero: "npcB" },
                    ]
                },
            ],
            behaviorLoop: [
                { type: "stand", direction: "left", time:1000},
                { type: "stand", direction: "right", time:500 },
               
            ],
                
            }, 
            npcC:  {
                type: "Person",
                x: utils.withGrid(2),
                y: utils.withGrid(9),
                src: "/images/characters/people/npc2.png",
                talking: [{
                    events: [
                        { type: "textMessage", text: " what shall I have? They are saying the special pizza is not avilable.", faceHero: "npcC" },
                    ]
                },
            ],
            behaviorLoop: [
                { type: "stand", direction: "right"},
                
            ],
                
            }, 
            npcD:  {
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(10),
                src: "/images/characters/people/npc7.png",
                talking: [{
                    events: [
                        { type: "textMessage", text: " It's delicious ?", faceHero: "npcD" },
                    ]
                },
            ],
            behaviorLoop: [
                { type: "stand", direction: "right"},
                
            ],
                
            }, 
            npcE: {
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(10),
                src: "/images/characters/people/npc1.png",
                talking: [{
                    events: [
                        { type: "textMessage", text: " hummm ?", faceHero: "npcE" },
                    ]
                },
            ],
            behaviorLoop: [
                { type: "stand", direction: "left"},
                
            ],
                
            }, 
            

    },
    walls: {
        //buttom wall
        [utils.asGridCoord(1, 12)]: true,
        [utils.asGridCoord(2, 12)]: true,
        [utils.asGridCoord(3, 12)]: true,
        [utils.asGridCoord(4, 12)]: true,
        [utils.asGridCoord(5, 13)]: true,
        [utils.asGridCoord(6, 12)]: true,
        [utils.asGridCoord(6, 12)]: true,
        [utils.asGridCoord(7, 12)]: true,
        [utils.asGridCoord(8, 12)]: true,
        [utils.asGridCoord(8, 12)]: true,
        [utils.asGridCoord(9, 12)]: true,

        //right wall
        [utils.asGridCoord(10,11 )]: true,
        [utils.asGridCoord(10,10 )]: true,
        [utils.asGridCoord(10,9 )]: true,
        [utils.asGridCoord(10,8 )]: true,
        [utils.asGridCoord(10,7 )]: true,
        [utils.asGridCoord(10,6 )]: true,
        [utils.asGridCoord(10,5 )]: true,


        //top wall
        [utils.asGridCoord(9,4 )]: true,
        [utils.asGridCoord(8,4 )]: true,
        [utils.asGridCoord(7,3 )]: true,
        [utils.asGridCoord(6,3 )]: true,
        [utils.asGridCoord(5,3 )]: true,
        [utils.asGridCoord(4,3 )]: true,
        [utils.asGridCoord(3,3 )]: true,
        [utils.asGridCoord(2,3 )]: true,
        [utils.asGridCoord(1,3 )]: true,

        //left wall
        [utils.asGridCoord(0,4)]: true,
        [utils.asGridCoord(0,5)]: true,
        [utils.asGridCoord(0,6)]: true,
        [utils.asGridCoord(0,7)]: true,
        [utils.asGridCoord(0,8)]: true,
        [utils.asGridCoord(0,9)]: true,
        [utils.asGridCoord(0,10)]: true,
        [utils.asGridCoord(0,11)]: true,

        //for counter and tables
        [utils.asGridCoord(1,6)]: true,
        [utils.asGridCoord(2,6)]: true,
        [utils.asGridCoord(3,6)]: true,
        [utils.asGridCoord(4,6)]: true,
        [utils.asGridCoord(5,6)]: true,
        [utils.asGridCoord(6,6)]: true,
        [utils.asGridCoord(3,9)]: true,
        [utils.asGridCoord(8,10)]: true,

    

    },

      //trigger the following cutscene if hero walk in certain coorindate 
      cutsceneSpaces: {
        [utils.asGridCoord(5, 12)]: [{
            events: [
                { type: "changeMap",
                 map: "StreetNorth",
                x: utils.withGrid(7),
                y: utils.withGrid(5),
                direction:"down"
            },
            ]
        }],
},
    },











}