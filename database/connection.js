const mongoose = require("mongoose");

const DBConnection = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGODB_URL}/${process.env.DATABASE_NAME}`
    );
    console.log(`MongoDB database Connected`);
  } catch (error) {
    console.log("Database connection error: ", error);
    process.exit(1);
  }
};
module.exports = DBConnection;
