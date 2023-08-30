const mongoClient = require('mongodb').MongoClient;
const state = {
    db: null,
};

module.exports.connect = function(done) {
    const url = 'mongodb+srv://Effinjoewilson:XXrYGYTCGvIR3Mdx@cluster0.iun1f8l.mongodb.net/';
    const dbname = 'shopping';

    mongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) return done(err);

        state.db = client.db(dbname);
        done();
    });
};

module.exports.get = function() {
    return state.db; 
};
