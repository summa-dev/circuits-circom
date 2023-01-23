const fs = require('fs');

function parseCsv(path) {

  // Read the CSV file
  const file = fs.readFileSync(path, "utf8");

  // Split the file into lines
  const lines = file.split("\n");

  // Split each line into values
  const values = lines.map((line) => line.split(","));

  // remove the first line (header)
  values.shift();

    let usernamesToBigInt = [];
    let salts = [];
    let balances = [];

    for (let i = 0; i < values.length; i++) {
    let [username, salt, balance] = values[i];
    usernamesToBigInt.push(parseUsername(username));
    salts.push(BigInt(salt));
    balances.push(BigInt(balance));
    }

    return { usernamesToBigInt, salts, balances };
}

function parseUsername(username) {

    const encoder = new TextEncoder();
    const utf8bytes = encoder.encode(username); 
    
    const bigIntNumber = BigInt("0x" + utf8bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''));

    return bigIntNumber;
}

module.exports = parseCsv;