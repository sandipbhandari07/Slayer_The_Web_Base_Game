class DirectionInput {
    constructor() {
      this.heldDirections = [];
  //mapping keys to be used
      this.map = {
        "ArrowUp": "up",
        "KeyW": "up",
        "ArrowDown": "down",
        "KeyS": "down",
        "ArrowLeft": "left",
        "KeyA": "left",
        "ArrowRight": "right",
        "KeyD": "right",
      }
    }
  
    get direction() {
      return this.heldDirections[0];
    }
  
    main() {
      document.addEventListener("keydown", e => {
        const dir = this.map[e.code];
        if (dir && this.heldDirections.indexOf(dir) === -1) { //check if we pressed the valid key
          this.heldDirections.unshift(dir);// if unvalid the character wont move
        }
      });
      document.addEventListener("keyup", e => {
        const dir = this.map[e.code];
        const index = this.heldDirections.indexOf(dir);
        if (index > -1) { //to return empty array if we release the valid key
          this.heldDirections.splice(index, 1);
        }
      })
  
    }
  
  }