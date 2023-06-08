const utils = {
    withGrid(n) {
        return n * 16; // takes n number and multiply it by 16
    },
    asGridCoord(x, y) {
        return `${x*16},${y*16}`
    },
    nextPosition(initialX, initialY, direction) {
        let x = initialX;
        let y = initialY;
        const size = 16;
        if (direction === "left") {
            x -= size;
        } else if (direction === "right") {
            x += size;
        } else if (direction === "up") {
            y -= size;
        } else if (direction === "down") {
            y += size;
        }
        return { x, y };
    },

    //making so that the NPCs face the hero while taking
    oppositeDirection(direction) {
        if (direction === "left") { return "right" }
        if (direction === "right") { return "left" }
        if (direction === "up") { return "down" }
        return "up"
    },

    //time to wait for certain second after attacking
    wait(ms){
        return new Promise(resolve =>{
            setTimeout(()=>{
                resolve()
            },ms)
        })
    },

    //select randomly form an array to set some randomness 
    randomFromArray(array){
        return array [Math.floor(Math.random()*array.length)]
    },

    //checking what the characters are doing
    emitEvent(name, detail) {

        const event = new CustomEvent(name, {
            detail
        });
        document.dispatchEvent(event);

    }

}