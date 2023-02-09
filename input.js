// create an json object with a single key called leaves and 1000 values in that 
// save it to a specific directory. Pass it as a parameter from the script
var fs = require('fs');

function createinput() {
    var json = {
        "leaves": []
    };

    for (var i = 0; i < 1000; i++) {
        json.leaves.push(i);
    }

    // save it to a file called input.json
    fs.writeFile(`input.json`, JSON.stringify(json), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to input.json");
        }
    });

}

createinput()