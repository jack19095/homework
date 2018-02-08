const MongoClient = require('mongodb').MongoClient;
// Connect to the db mongodb://<user>:<password>@<host>:<port>/<databasename>
MongoClient.connect(
  "mongodb://jack:xUP6m3ejE4@ds117758.mlab.com:17758/line3bot",
  function(err, client) {
    if (err) {
      return console.dir(err);
    }
    db = client.db('line3bot');
  }
);

const dataStore = {};

function add(userId, item) {
  let wishlist = db.collection("wishlist");
  wishlist.insert({ userId, item });
}

async function list(userId) {
  let wishlist = db.collection("wishlist");

  let results = await wishlist.find({userId}).toArray() ; 
  return results.map(result => result.item);
  // console.log(results);
}

async function del(userId, item) {
    let wishlist = db.collection("wishlist");
    let result = await wishlist.deleteOne({userId, item})
    console.log(result);
    return result;
  }

module.exports = {
  add,
  list
};