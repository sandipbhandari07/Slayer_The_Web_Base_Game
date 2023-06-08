class Battle {
    constructor({ enemy, onComplete }) {
  
      this.enemy = enemy;
      this.onComplete = onComplete;
  
      this.combatants = {
        // "player1": new Combatant({
        //   ...Pizzas.s001,
        //   team: "player",
        //   hp: 30,
        //   maxHp: 50,
        //   xp: 95,
        //   maxXp: 100,
        //   level: 1,
        //   status: { type: "saucy" },
        //   isPlayerControlled: true
        // }, this),
        // "player2": new Combatant({
        //   ...Pizzas.s002,
        //   team: "player",
        //   hp: 30,
        //   maxHp: 50,
        //   xp: 75,
        //   maxXp: 100,
        //   level: 1,
        //   status: null,
        //   isPlayerControlled: true
        // }, this),
        // "enemy1": new Combatant({
        //   ...Pizzas.v001,
        //   team: "enemy",
        //   hp: 1,
        //   maxHp: 50,
        //   xp: 20,
        //   maxXp: 100,
        //   level: 1,
        // }, this),
        // "enemy2": new Combatant({
        //   ...Pizzas.f001,
        //   team: "enemy",
        //   hp: 25,
        //   maxHp: 50,
        //   xp: 30,
        //   maxXp: 100,
        //   level: 1,
        // }, this)
      }
  
      this.activeCombatants = {
        player: null, //"player1",
        enemy: null, //"enemy1",
      }
  
      //Dynamically add the Player team
      window.playerState.lineup.forEach(id => {
        this.addCombatant(id, "player", window.playerState.pizzas[id])
      });
      //Now the enemy team
      Object.keys(this.enemy.pizzas).forEach(key => {
        this.addCombatant("e_"+key, "enemy", this.enemy.pizzas[key])
      })
  
  
      //Start empty
      this.items = []
  
      //Add in player items
      window.playerState.items.forEach(item => {
        this.items.push({
          ...item,
          team: "player"
        })
      })
  
      this.usedInstanceIds = {};
  
    }
  
    addCombatant(id, team, config) {
        this.combatants[id] = new Combatant({
          ...Pizzas[config.pizzaId],
          ...config,
          team,
          isPlayerControlled: team === "player", // player can control if it is true
        }, this)
  
        //Populate first active pizza
        this.activeCombatants[team] = this.activeCombatants[team] || id
    }
  
       //creating dynamic battle sprites for hero and enemy
    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("Battle");
      this.element.innerHTML = (`
      <div class="Battle_hero">
        <img src="${'/images/characters/people/hero.png'}" alt="Hero" />
      </div>
      <div class="Battle_enemy">
        <img src=${this.enemy.src} alt=${this.enemy.name} />
      </div>
      `)
    }
  
     main(container) {
      this.createElement();
      container.appendChild(this.element);
  
      this.playerTeam = new Team("player", "Hero");
      this.enemyTeam = new Team("enemy", "Bully");
  
      Object.keys(this.combatants).forEach(key => {
        let combatant = this.combatants[key];
        combatant.id = key;
        combatant.main(this.element)
        
        //Add to correct team
        if (combatant.team === "player") {
          this.playerTeam.combatants.push(combatant);
        } else if (combatant.team === "enemy") {
          this.enemyTeam.combatants.push(combatant);
        }
      })
  
      //putting every thing form the combatant to battle
  
      this.playerTeam.main(this.element);
      this.enemyTeam.main(this.element);
      //for whose turn it is and what action it did
      this.turnCycle = new TurnCycle({
        battle: this,
        onNewEvent: event => {
          return new Promise(resolve => {
            const battleEvent = new BattleEvent(event, this)// passing battle(this)
            battleEvent.main(resolve);
          })
        },
        onWinner: winner => {
            //after the battle finishes the player keep all the changes(lvl, exp, hp,etc)
          if (winner === "player") {
            const playerState = window.playerState;
            Object.keys(playerState.pizzas).forEach(id => {
              const playerStatePizza = playerState.pizzas[id];
              const combatant = this.combatants[id];
              if (combatant) {
                playerStatePizza.hp = combatant.hp;
                playerStatePizza.xp = combatant.xp;
                playerStatePizza.maxXp = combatant.maxXp;
                playerStatePizza.level = combatant.level;
              }
            })
  
            //Get rid of player used items
            playerState.items = playerState.items.filter(item => {
              return !this.usedInstanceIds[item.instanceId]
            })

            //send signal to update
            utils.emitEvent("PlayerStateUpdated");
          }
  
          this.element.remove();
          this.onComplete(winner === "player");
        }
      })
      this.turnCycle.main();
  
  
    }
  
  }