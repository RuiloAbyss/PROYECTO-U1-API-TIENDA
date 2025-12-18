const { db } = require("../firebase");

const paymentsCollection = db.collection("payments");

module.exports = { paymentsCollection };
