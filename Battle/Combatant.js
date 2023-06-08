class Combatant {
    constructor(config, battle) {
        Object.keys(config).forEach(key => {
            this[key] = config[key];
        })
        this.hp=typeof(this.hp)==="undefined" ? this.maxHp : this.hp;
        this.battle = battle;
    }

    get hpPercent() {
        const percent = this.hp / this.maxHp * 100; // converting the max hp into percent
        return percent > 0 ? percent : 0; // return 0 if the percent is less or equal to zero
    }

    get xpPercent() {
        return this.xp / this.maxXp * 100; // converting the max xp into percent

    }

    // to know which one is active in battle
    get isActive() {
        return this.battle?.activeCombatants[this.team] === this.id; //id is either player1/2... or enemy1/2..
    }

    //dynamically providing exp to player
    get givesXp(){
        return this.level*20;
    }


    createElement() {
        this.hudElement = document.createElement("div");
        this.hudElement.classList.add("Combatant");
        this.hudElement.setAttribute("data-combatant", this.id); // id is for player or enemy
        this.hudElement.setAttribute("data-team", this.team); // which team it belongs to

        //for name, level, hp bar and xp bar
        this.hudElement.innerHTML = (`
        <p class="Combatant_name">${this.name}</p>

        <p class="Combatant_level"></p>
        
        <div class="Combatant_character_corp">
        <img class="Combatant_character" alt="${this.name}" src="${this.src}" />
        </div>

        <img class="Combatant_type" src="${this.icon}" alt="${this.type}" />
    
        <svg viewBox="0 0 26 3" class="Combatant_life-container">
        <rect x=0 y=0 width="0%" height=1 fill="#82ff71"/>
        <rect x=0 y=1 width="0%" height=2 fill="#3ef126"/>
        </svg>

        <svg viewBox="0 0 26 2" class="Combatant_xp-container">
        <rect x=0 y=0 width="0%" height=1 fill="#ffd76a"/>
        <rect x=0 y=1 width="0%" height=1 fill="#ffc934"/>
        </svg>

        <p class="Combatant_status"> </p>  
        `);

        this.pizzaElement = document.createElement("img");
        this.pizzaElement.classList.add("Pizza");
        this.pizzaElement.setAttribute("src", this.src); // src is defined in pizzas.js
        // this.pizzaElement.setAttribute("alt", this.name); //
        this.pizzaElement.setAttribute("data-team", this.team); // which team the pizza belongs to 

        //reference for hp so we dont have to keep writing the code when the hp changes
        this.hpFills = this.hudElement.querySelectorAll(".Combatant_life-container >rect");

        //reference for xp so we dont have to keep writing the code when the xp changes
        this.xpFills = this.hudElement.querySelectorAll(".Combatant_xp-container >rect");
    }

    //changes to thigs like hp and exp bar , level , statue etc
    update(changes = {}) {
        //update everything incoming

        Object.keys(changes).forEach(key => {
            this[key] = changes[key]
        });

        this.hudElement.setAttribute("data-active", this.isActive); //active flag for the correct hud
        this.pizzaElement.setAttribute("data-active", this.isActive); //active flag for the correct pizza

        //update hp and exp percet fill
        this.hpFills.forEach(rect => rect.style.width = `${this.hpPercent}%`); //% is just for comparision
        this.xpFills.forEach(rect => rect.style.width = `${this.xpPercent}%`); //% is just for comparision

        this.hudElement.querySelector(".Combatant_level").innerText = this.level; // for level on screen

        //update status
        const statusElement = this.hudElement.querySelector(".Combatant_status");
        if(this.status){
            statusElement.innerText=this.status.type;
            statusElement.style.display="block";//display the name

        }else{
            statusElement.innerText="";
            statusElement.style.display="none;"
        }

    }

    //implementing what clumsy status do 
    getReplacedEvents(originalEvents){
        if(this.status?.type ==="clumsy" && utils.randomFromArray([false,true,false])){//attack fails 1/3 of the time
            return[
                {type:"textMessage",text:`${this.name} flops over!`}, // this message will be shown if it lands on true
            ]
        }
        return originalEvents;
    }

    // implementing what saucy status do 
    getPostEvents(){
        if(this.status?.type==="saucy"){
            return[
                {type:"textMessage",text:"feelin' saucy!"},
                {type:"stateChange",recover:5,onCaster:true}
            ]
        }
        return[];
    }

    //making so that the status only last certain turn
    decrementStatus(){
        if(this.status?.expiresIn>0){
            this.status.expiresIn -=1;
            if(this.status.expiresIn===0){
                this.update({
                    status:null
                })
                return{
                    type:"textMessage",
                    text:"Status expired!"
                }
            }
        }
        return null; 
    }

    main(container) {
        this.createElement();
        container.appendChild(this.hudElement);
        container.appendChild(this.pizzaElement);
        this.update();

    }
}