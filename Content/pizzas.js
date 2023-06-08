//type of pizzas
window.PizzaTypes = {
    normal: "normal",
    spicy: "spicy",
    veggie: "veggie",
    fungi: "fungi",
    chill: "chill",
}


//defining different types of pizza
window.Pizzas = {
    //spicy 
    "s001": {
        name: "Slice Samurai",
        description:"pizza desc here",
        type: PizzaTypes.spicy,
        src: "/images/characters/pizzas/s001.png",
        icon: "/images/icons/spicy.png",
        actions: ["clumsyStatus","damage4","SupersaucyStatus",],
    },
    "s002": {
        name: "Flame On",
        description:"will burn your tongue",
        type: PizzaTypes.spicy,
        src: "/images/characters/pizzas/s002.png",
        icon: "/images/icons/spicy.png",
        actions: ["damage1","damage2","saucyStatus"],
    },
    "s003": {
        name: "Dry Heat",
        description:"hot enough to dry the earth",
        type: PizzaTypes.spicy,
        src: "/images/characters/pizzas/s003.png",
        icon: "/images/icons/spicy.png",
        actions: ["damage1",,"damage3","clumsyStatus"],
    },

    //veggie
    "v001": {
        name: "Call Me Kale",
        description:" my name is kale, vagge kale",
        type: PizzaTypes.veggie,
        src: "/images/characters/pizzas/v001.png",
        icon: "/images/icons/veggie.png",
        actions: ["damage1","damage3","clumsyStatus"],
    },
    "v002": {
        name: "Bro-broccoli",
        description:" the power in me bro",
        type: PizzaTypes.veggie,
        src: "/images/characters/pizzas/v002.png",
        icon: "/images/icons/veggie.png",
        actions: ["damage1","damage2","saucyStatus"],
    },
    "v003": {
        name: "Aubergine",
        description:" I am eggplant",
        type: PizzaTypes.veggie,
        src: "/images/characters/pizzas/v003.png",
        icon: "/images/icons/veggie.png",
        actions: ["damage2","damage3","clumsyStatus"],
    },

    //fungai
    "f001": {
        name: "Portobello Express",
        description:"I am Fun guy",
        type: PizzaTypes.fungi,
        src: "/images/characters/pizzas/f001.png",
        icon: "/images/icons/fungi.png",
        actions: ["damage3","damage2","saucyStatus"],
    },
    "f002": {
        name: "Oyster Shroom",
        description:"i look like Oysters",
        type: PizzaTypes.fungi,
        src: "/images/characters/pizzas/f002.png",
        icon: "/images/icons/fungi.png",
        actions: ["damage2","damage3","clumsyStatus"],
    },
    "f003": {
        name: "Cremini Bisporus",
        description:"mario eat me",
        type: PizzaTypes.fungi,
        src: "/images/characters/pizzas/f003.png",
        icon: "/images/icons/fungi.png",
        actions: ["damage1","damage3","saucyStatus"],
    },

    //chill
    "c001": {
        name: "Digiorno",
        description:"Real pizzeria-quality — seriously!",
        type: PizzaTypes.chill,
        src: "/images/characters/pizzas/c001.png",
        icon: "/images/icons/chill.png",
        actions: ["saucyStatus","damage3","damage1"],
    },
    "c002": {
        name: "Udi's",
        description:"loved the cold and crispy outer edge",
        type: PizzaTypes.chill,
        src: "/images/characters/pizzas/c002.png",
        icon: "/images/icons/chill.png",
        actions: ["clumsyStatus","damage2","damage1"],
    },

    "c003": {
        name: "Banza",
        description:" Chill gluten-free crust",
        type: PizzaTypes.chill,
        src: "/images/characters/pizzas/c003.png",
        icon: "/images/icons/chill.png",
        actions: ["saucyStatus","damage4","damage1"],
    },


}