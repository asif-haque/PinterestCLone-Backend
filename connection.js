const { mongoose } = require("mongoose");

const connectMongoDb = () => {
  console.log(process.env.MONGO_URI);
  return mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("Mongo error: ", err));
};

module.exports = connectMongoDb;
