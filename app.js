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

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//get all movies list AP1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
        movie_name
    FROM 
        movie;`;

  const moviesList = await db.all(getMoviesQuery);

  response.send(
    moviesList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//add a movie API2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
    INSERT INTO movie
        (director_id,
        movie_name,
        lead_actor)
    VALUES 
            (${directorId},
            '${movieName}',
            '${leadActor}')
    ;`;

  await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

//get a single movie API3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
    SELECT
        * 
    FROM 
        movie
    WHERE 
        movie_id = ${movieId};`;

  try {
    const movie = await db.get(getMovieQuery);

    response.send(convertMovieDbObjectToResponseObject(movie));
  } catch (error) {
    console.log(error.message);
  }
});

//update movie API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const { directorId, movieName, leadActor } = request.body;

  const updateMovieQuery = `
    UPDATE movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};`;

  await db.run(updateMovieQuery);

  response.send("Movie Details Updated");
});

//Delete movie API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
    DELETE FROM
        movie
    WHERE 
        movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);

  response.send("Movie Removed");
});

//Get directors API6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
    * 
    FROM 
    director
    ;`;

  const directors = await db.all(getDirectorsQuery);

  response.send(
    directors.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

//get director movies API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getDirectorMoviesQuery = `
    SELECT
        movie_name
    FROM 
        movie
    WHERE 
        director_id = ${directorId};`;

  const directorMovieList = await db.all(getDirectorMoviesQuery);

  response.send(
    directorMovieList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
