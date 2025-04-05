const Movie = require("./movie");
const Actor = require("./actor");
const MovieActor = require("./movieActor");
const Genre = require("./genre");
const MovieGenre = require("./movieGenre");

// Définir les associations
Movie.belongsToMany(Actor, { through: MovieActor, foreignKey: 'id_movie', otherKey: 'id_actor' });
Actor.belongsToMany(Movie, { through: MovieActor, foreignKey: 'id_actor', otherKey: 'id_movie' });

// Si vous avez aussi des associations pour les genres
Movie.belongsToMany(Genre, { through: MovieGenre, foreignKey: 'id_movie', otherKey: 'id_genre' });
Genre.belongsToMany(Movie, { through: MovieGenre, foreignKey: 'id_genre', otherKey: 'id_movie' });

module.exports = {
  Movie,
  Actor,
  MovieActor,
  Genre,
  MovieGenre
};