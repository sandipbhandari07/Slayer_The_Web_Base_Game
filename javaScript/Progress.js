class Progress{
    constructor(){
        this.mapId="Kitchen";
        this.startingHeroX=0;
        this.startingHeroY=0;
        this.startingHeroDirection="down";
        this.saveFileKey="Slayer_SaveFile";
        
    }

    //saving the game
    save(){
        window.localStorage.setItem(this.saveFileKey,JSON.stringify({
            mapId:this.mapId,
            startingHeroX: this.startingHeroX,
            startingHeroY: this.startingHeroY,
            startingHeroDirection: this.startingHeroDirection,
            playerState:{
                pizzas:playerState.pizzas,
                lineup: playerState.lineup,
                items: playerState.items,
                storyFlags:playerState.storyFlags,
            }
        }))

    }

    //checking if there is save file or not
    getSaveFile(){
        const file =window.localStorage.getItem(this.saveFileKey);
        return file ? JSON.parse(file):null
    }

    // to load the save file
    load(){
        const file=this.getSaveFile();
        if(file){
            this.mapId=file.mapId;
            this.startingHeroX=file.startingHeroX;
            this.startingHeroY=file.startingHeroY;
            this.startingHeroDirection=file.startingHeroDirection;
            Object.keys(file.playerState).forEach(key=>{
                playerState[key]=file.playerState[key];
            })
        }

    }
}