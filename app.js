const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(9000, () => {
      console.log("Server Running at http://localhost:9000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//get all movies list AP1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
        *
    FROM 
        movie;`;

  const moviesList = await db.all(getMoviesQuery);

  response.send(moviesList);
});

//add a movie API2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { director_id, movie_name, lead_actor } = movieDetails;

  const addMovieQuery = `
    INSERT INTO movie
        (director_id,
        movie_name,
        lead_actor)
    VALUES 
            (${director_id},
            ${movie_name},
            ${lead_actor})
    ;`;

  await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});
