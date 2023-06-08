class TitleScreen{
    constructor({progress}){
        this.progress=progress;

    }


    getOptions(resolve){
        const safeFile = this.progress.getSaveFile();
        return[
        //have new game option
        {
            label:"New Game",
            description:"Start a new advanture!!",
            handler:()=>{
                this.close();
                resolve();
            }
        },

        //for continue option
        safeFile ?{
            label:"Continue",
            description:"Resume your adventure",
            handler:()=>{
                this.close();
                resolve(safeFile);
            }
        } : null
    ].filter(v=>v); // we will get two option in main menu when there is save file

    }


    createElement(){
        this.element=document.createElement("div");
        this.element.classList.add("TitleScreen");
        this.element.innerHTML=(`
            <img class="TitleScreen_logo" src="/images/logo.png" alt="Slayer" />
            <h1 class="heading"> Slayer </h1>
        `)
       
    }

    close(){
        this.keyboardMenu.end();
        this.element.remove();
    }


    main(container){
        return new Promise(resolve =>{
            this.createElement();
            container.appendChild(this.element);
            this.keyboardMenu=new KeyboardMenu();
            this.keyboardMenu.main(this.element);
            this.keyboardMenu.setOptions(this.getOptions(resolve));
        })
    }
}