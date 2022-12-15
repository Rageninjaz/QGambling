
console.log("hi");
var deck_id;
const convertCard = {
    ACE: 11,
    KING: 10,
    QUEEN: 10,
    JACK: 10,
    10: 10,
    9: 9,
    8: 8,
    7: 7,
    6: 6,
    5: 5,
    4: 4,
    3: 3,
    2: 2,
};
fetch(`https://deckofcardsapi.com/api/deck/new/shuffle`).then(response => response.json())
.then(json => {
    deck_id = json.deck_id;
    console.log(deck_id);
});

fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=2`).then(response => response.json())
.then(json => {
    const player = document.getElementById('player');
    const dealer = document.getElementById('dealer');
    
    document.getElementById("dealer").src= json.cards[1].image;
    console.log(`${json.cards[1].image}`);
    

    const playerCard = convertCard[json.cards[0].value];
    const dealerCard = convertCard[json.cards[1].value];

});

