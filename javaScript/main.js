(function() {
    const overworld = new Overworld({ //creaing game instance
        element: document.querySelector(".game-container") // calling game container
    });
    overworld.main(); // initaling the overworld after creating the above instance 
})
();