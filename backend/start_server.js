const server = require("./server");
const connectDB = require("./db");
const mongoose = require("mongoose");

mongoose.set("useFindAndModify", false);
const port = process.env.PORT || 8080;

connectDB();
server.listen(port, () => {
  console.log(`Listening at ${port}`);
});
