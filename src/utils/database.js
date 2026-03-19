// utils/database.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const login = encodeURIComponent(process.env.DB_USER);
const password = encodeURIComponent(process.env.DB_PASSWORD);
const dbName = "cjDrop";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${login}:${password}@sly95.rk84wkd.mongodb.net/${dbName}?retryWrites=true&w=majority`
    );
    console.log("Connexion à la Base de données réussie");
  } catch (error) {
    console.error("Echec de la connexion à la base de données", error);
    process.exit(1);
  }
};
