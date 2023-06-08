class BattleEvent {
    constructor(event, battle) {
        this.event = event;
        this.battle = battle;
    }

    //getting all the  message happening  in turn cycle
    textMessage(resolve) {

        const text = this.event.text
            .replace("{CASTER}", this.event.caster?.name) // replace caster with player/enemy name
            .replace("{TARGET}", this.event.target?.name) // show the name of the targeted player
            .replace("{ACTION}", this.event.action?.name) // show performed actions name
            .replace("{STATUS}", this.event.status?.name) // show the name of the staus

        const message = new TextMessage({
            text,
            onComplete: () => {
                resolve();
            }
        })
        message.main(this.battle.element); //showing the message in battle container
    }


    async stateChange(resolve){
        const{caster,target,damage,recover,status,action}=this.event;
        let who = this.event.onCaster ? caster : target; 

        if(damage){
        //modify the targets to have less hp after getting attacked
            target.update({
                hp:target.hp-damage
            })

        //start blinking when taking damage
        target.pizzaElement.classList.add("battle-damage-blink");

        }
        if (recover){
            let newHp=who.hp+recover;
            if(newHp>who.maxHP){
                newHp= who.maxHP;
            }
            who.update({
                hp:newHp
            })
        }
        if(status){
            who.update({
                status:{...status}

            })
            }
            if(status===null){
                who.update({
                    status:null
                })
        }

        //wait a little bit
        await utils.wait(600);

            //update to check for dead and active team
        this.battle.playerTeam.update();
        this.battle.enemyTeam.update();
        
        //stop blinking
        target.pizzaElement.classList.remove("battle-damage-blink");
        resolve();
    }

    //putting the menu on screen
    submissionMenu(resolve) {
        const {caster}=this.event;
        const menu = new SubmissionMenu({
            caster: this.event.caster,
            enemy: this.event.enemy,
            items:this.battle.items,
            //swap the team mate with the alive one
            replacements: Object.values(this.battle.combatants).filter(c => {
                return c.id !== caster.id && c.team === caster.team && c.hp > 0
            }),
            onComplete: submission => {
                //submisson {what move to use and who to use it on }
                resolve(submission)
            }
        })
        menu.main(this.battle.element); //showing in battle container
    }

    //resolve when team dies then swapping 
    replacementMenu(resolve){
        const menu= new ReplacementMenu({
            replacements:Object.values(this.battle.combatants).filter(c=>{
                return c.team=== this.event.team && c.hp >0
            }),
            onComplete: replacement=>{
                resolve(replacement)
            }
        })
        menu.main(this.battle.element)
    }
    //resolve replacement event
    async replace(resolve) {
        const {replacement} = this.event;

        //clear out the old combatant
        const prevCombatant = this.battle.combatants[this.battle.activeCombatants[replacement.team]];
        this.battle.activeCombatants[replacement.team] = null;//setting active member to be null so we can swap
        prevCombatant.update(); //active member should dissapear
        await utils.wait(400); //setting the timer so we can see the swap happen

        // in with the new team mate if avilable
        this.battle.activeCombatants[replacement.team] = replacement.id;
        replacement.update(); // new member should replace 
        await utils.wait(400);//setting the timer so we can see the swap happen

         //update to check for dead and active team
        this.battle.playerTeam.update();
        this.battle.enemyTeam.update();
        
        resolve();


    }

    //provide exp to the active player 
    giveXp(resolve){
        let amount= this.event.xp;
        const {combatant} =this.event;
        const step =()=>{
            if(amount>0){
                amount-=1;
                combatant.xp +=1;

                 //Check if we've hit level up point
        if (combatant.xp === combatant.maxXp) {
            combatant.xp = 0;   //setting the exp back to 0
            combatant.maxXp += 25; // setting next max exp poing
            combatant.level += 1; //increasing the lvl by 1
            combatant.maxHp +=25; // increase max hp by  25

          }

                combatant.update();
                requestAnimationFrame(step);
                return;
            }
            resolve();
        }
        requestAnimationFrame(step);
    }

    animation(resolve){
        const fn=BattleAnimations[this.event.animation];
        fn(this.event, resolve);
    }
    main(resolve) {
        this[this.event.type](resolve);
    }



}