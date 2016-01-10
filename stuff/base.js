function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}




// function() {
//     ws.send(JSON.stringify({
//         User: this.Name,
//         U_y: this.delta_y,
//         U_x: this.delta_x,
//         Status: true,
//     }));
// };

// function init() {

//     canvas = document.getElementById("testCanvas");
//     canvas.width = Screen.width / 2;
//     canvas.height = Screen.height / 2;

//     stage = new createjs.Stage(canvas);

//     var Graphics = createjs.Graphics;

//     timeCircle = stage.addChild(new Player(makeid(), '#F94F70', 100, 100));

//     fpsLabel = new createjs.Text("-- fps", "bold 14px Arial", "#FFF");
//     stage.addChild(fpsLabel);
//     fpsLabel.x = 10;
//     fpsLabel.y = 20;

//     createjs.Ticker.timingMode = createjs.Ticker.RAF;
//     createjs.Ticker.addEventListener("tick", tick);

//     var domain = document.location.hostname + (document.location.port ? ':' + document.location.port : '')

//     ws = new WebSocket("ws://" + domain + "/handler");

//     ws.onopen = function() {
//         timeCircle.sendToServer();
//     };

//     var players = new Array(timeCircle)

//     ws.onmessage = function(e) {

//         var msg = JSON.parse(e.data);
//         var res;
//         res = false;

//         players.forEach(function(item, i, arr) {
//             if (msg.User == item.getName()) {
//                 if (msg.Status) {
//                     item.setX(msg.U_x);
//                     item.setY(msg.U_y);
//                     res = true;
//                     console.log("user -" + msg.User + msg.U_x + msg.U_y);
//                 } else {
//                     console.log("user -" + msg.User + " REMOVED! ");
//                     stage.removeChild(players[i]);
//                     delete players[i];
//                 }
//             }
//         });

//         if ((!res) && (msg.Status)) {
//             console.log("added new player");
//             var rnd_color = getRandomColor();
//             players.push(stage.addChild(new Player(msg.User, rnd_color, msg.U_x, msg.U_y)));
//         }
//     };

//     ws.onclose = function() {
//         alert("closed");
//     };
// }


var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', {
    preload: preload,
    create: create,
    update: update,
    render: render
});



function preload() {
    game.load.image('mushroom', './stuff/sprites/mushroom2.png');
    game.load.spritesheet('veggies', './stuff/sprites/fruitnveg32wh37.png', 32, 32);
    game.load.tilemap('mapa', './stuff/sprites/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('ground_1x1', './stuff/sprites/ground_1x1.png');
}

var player;
var group;
var cursors;
var players = new Array();
var items = new Array();
var myName;

var delta_x = 0;
var delta_y = 0;
var score = 0;
var text;

function create() {
    map = game.add.tilemap('mapa');
    map.addTilesetImage('ground_1x1');

    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();

    // game.world.setBounds(0, 0, 2000, 2000);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.time.advancedTiming = true;
    game.stage.backgroundColor = '#2d2d2d';
    cursors = game.input.keyboard.createCursorKeys();
    addPlayer(makeid(), 100, 100);

    var style = {
        font: "20px Courier",
        fill: "#fff",
        tabs: 132
    };
    text = game.add.text(800 - 120, 50, "Score: " + score, style);
    text.fixedToCamera = true;
    text.cameraOffset.setTo(800 - 120, 50);
    game.camera.follow(player);
    wsinit();
}

var flag = true;
var deltamove = 10;

function update() {
    var flag2 = false;
    if (cursors.left.isDown) {
        flag2 = true;
        delta_x += -(deltamove);
    } else if (cursors.right.isDown) {
        flag2 = true;
        delta_x += deltamove;
    }

    if (cursors.up.isDown) {
        flag2 = true;
        delta_y += -(deltamove);
    } else if (cursors.down.isDown) {
        flag2 = true;
        delta_y += deltamove;
    }

    if (flag && flag2) {
        flag = false;
        sendMove(player.MyName, delta_x, delta_y);
    }
}

function addPlayer(_name, _x, _y) {

    var temp = game.add.sprite(_x, _y, 'mushroom');
    temp.scale.setTo(0.5, 0.5);
    temp.MyName = _name;
    console.log("name " + temp.MyName)
    game.physics.arcade.enable(temp);
    temp.body.allowGravity = false;
    players.push(temp);

    if (typeof player === "undefined") {
        delta_x = _x;
        delta_y = _y;
        player = players[0];
    }
}


function removePlayer(_name) {
    players.forEach(function(item, i, arr) {
        if (item.MyName == _name) {
            item.kill();
        }
    });
}

function setLocation(_name, _x, _y) {
    players.forEach(function(item, i, arr) {
        if (item.MyName == _name) {
            tween = game.add.tween(item).to({
                x: _x,
                y: _y
            }, 2, Phaser.Easing.Linear.None, true);
            if (player.MyName == _name) {
                tween.onComplete.add(function() {
                    flag = true;
                    delta_x = _x;
                    delta_y = _y;
                }, this);
            }
        }
    });
}

function removeItem(_id, _name) {
    if (_name == player.MyName) {
        score += 1;
        text.setText("Score: " + score);
    }
    items.forEach(function(item, i, arr) {
        if (item.custom_id == _id) {
            item.kill();
        }
    });
}

function addItem(_x, _y, _item, _id) {
    var newitem = game.add.sprite(_x, _y, 'veggies', _item);
    newitem.custom_id = _id;
    items.push(newitem);
}


function render() {
    // game.debug.text("fps " + game.time.fps || '--', 32, 14);
    // game.debug.cameraInfo(game.camera, 32, 32);
    // game.debug.spriteCoords(player, 32, 500);
}
