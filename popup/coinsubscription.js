var COINSUBSCRIPTION = COINSUBSCRIPTION || (function(){
    var _args = {}; // private

    return {
        init : function(Args) {
            _args = Args;
        },
        getId : function(i) {
            return _args[i];
        }
    };
}());

console.log(COINSUBSCRIPTION.getId(0));

document.write('<link rel="stylesheet" type="text/css" href="coinsubscription.css">');

var button = '<button id="coinsubscriptionbtn" onclick="openCoinSubscription()">Subscribe Now</button>';

var html = '<div id="coinsubscriptionpopup">';
html += '<button class="" id="coinsubscriptionclosebtn" onclick="closeCoinSubscription()">x</button>';
html += '<a href="#"'+COINSUBSCRIPTION.getId(0)+' id="subscribenowbtn">Subscribe Now</a>';
html += '<p id="coinsubscriptionpopupp">Automatic recurring token payments with TokenSubscription</p>';
html += '</div>';

// create container
buttoncontainer = document.createElement('div');
buttoncontainer.id = 'coinsubscriptionbuttoncont';
document.body.insertAdjacentElement('afterbegin', buttoncontainer);
document.getElementById("coinsubscriptionbuttoncont").innerHTML = button;

container = document.createElement('div');
container.id = 'coinsubscriptioncont';
document.body.insertAdjacentElement('afterbegin', container);
document.getElementById("coinsubscriptioncont").innerHTML = html;


function openCoinSubscription() {
    document.getElementById("coinsubscriptioncont").style.display = "block";
    document.getElementById("coinsubscriptionbtn").style.display = "none";
}

function closeCoinSubscription() {
    document.getElementById("coinsubscriptioncont").style.display = "none";
    document.getElementById("coinsubscriptionbtn").style.display = "block";
}
