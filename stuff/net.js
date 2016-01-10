//*************network*****************
var domain = document.location.hostname + (document.location.port ? ':' + document.location.port : '')
var ws

function wsinit() {
    ws = new WebSocket("ws://" + domain + ":8080/handler");

    ws.onopen = function() {
        ws.send(JSON.stringify({
            Name: player.MyName,
            Action: "myname",
            Data: {
                Dx: player.x,
                Dy: player.y,
            },
        }));
    };

    ws.onmessage = function(e) {

        var msg = JSON.parse(e.data);
        var res;
        res = false;

        if (msg.Action == "additem") {
            for (var _item = 0; _item < msg.Data.length; _item++) {
                addItem(msg.Data[_item].WorldX, msg.Data[_item].WorldY, msg.Data[_item].Item, msg.Data[_item].GlobalId);
            }
        }

        if (msg.Action == "moveplayer") {
            setLocation(msg.Name, msg.Data.Dx, msg.Data.Dy);
        }

        if (msg.Action == "addplayer") {
            addPlayer(msg.Name, msg.Data.Dx, msg.Data.Dy);
        }

        if (msg.Action == "removeplayer") {
            removePlayer(msg.Name);
        }

        if (msg.Action == "removeitem") {
            for (var _item = 0; _item < msg.Data.length; _item++) {
                removeItem(msg.Data[_item].Id);
            }
        }

        if (msg.Action == "pickupitem") {
            // for (var _item = 0; _item < msg.Data.length; _item++) {
            // removeItem(msg.Data[_item].Id);
            // }
            removeItem(msg.Data.Id, msg.Name);
        }

    };

    ws.onclose = function() {
        alert("closed");
    };
}

function sendMove(_name, _x, _y) {
    ws.send(JSON.stringify({
        Name: _name,
        Action: "move",
        Data: {
            Dx: _x,
            Dy: _y
        },
    }));
}
