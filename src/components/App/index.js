import { Component } from 'react';

import Card from '../Card';
import MovieAPI from '../../service';
import './app.css';

export default class App extends Component {
  state = {
    movies: null,
  };

  movieAPI = new MovieAPI();

  componentDidMount() {
    this.loadMovies();
  }

  onMoviesLoaded = (movies) => {
    this.setState({ movies });
  };

  loadMovies() {
    this.movieAPI
      .getMovies()
      .then((data) => data.results)
      .then(this.onMoviesLoaded);
  }

  render() {
    const { movies } = this.state;
    return (
      <div className="app">
        <div className="app__movies-list">
          {movies &&
            movies.map((movie) => (
              <Card
                key={movie.id}
                title={movie.title}
                date={movie.release_date}
                poster={movie.poster_path}
                overview={movie.overview}
              />
            ))}
        </div>
      </div>
    );
  }
}
