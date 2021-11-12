// Prepare the Multipeer Namespace
function prepareNamespace(hash, set_location) {
  // remove # from the hash
  let ns = hash.replace(/^#/, '');
  if (/^[a-z]{3}-[a-z]{3}-[a-z]{3}$/.test(ns)) {
    console.log(`Checked existing namespace '${ns}'`);
    return ns;
  }
  ns = generateRandomAlphaString('-', 3, 3, 3);
  console.log(`Created new namespace '${ns}'`);
  if (set_location) window.location.hash = ns;
  return ns;
}

function generateRandomAlphaString(separator, ...groups) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let ns = [];
  for (let group of groups) {
    let str = '';
    for (let i = 0; i < group; i++) {
      str += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    ns.push(str);
  }
  return ns.join(separator);
}

/**
David start
*/



/**
David end
*/



/**
Michael start
*/



/**
Michael end
*/



/**
Chiachi start
*/


/**
Chiachi end
*/
