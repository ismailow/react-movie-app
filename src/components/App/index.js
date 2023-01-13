import { Component } from 'react';
import { Alert, Spin } from 'antd';
import { Offline, Online } from 'react-detect-offline';

import Card from '../Card';
import MovieAPI from '../../service';
import './app.css';

export default class App extends Component {
  state = {
    movies: {},
    loading: true,
    error: false,
    notFoundError: false,
  };

  movieAPI = new MovieAPI();

  componentDidMount() {
    this.loadMovies();
  }

  onMoviesLoaded = (movies) => {
    this.setState({ movies, loading: false });
  };

  onError = () => {
    this.setState({
      error: true,
      loading: false,
    });
  };

  onNotFoundError = () => {
    this.setState({
      error: true,
      loading: false,
      notFoundError: true,
    });
  };

  loadMovies() {
    this.movieAPI
      .getMovies()
      .then((data) => data.results)
      .then(this.onMoviesLoaded)
      .catch((err) => {
        if (err.name === 'NotFoundError') {
          this.onNotFoundError();
        } else {
          this.onError();
        }
      });
  }

  render() {
    const { movies, loading, error, notFoundError } = this.state;
    const hasData = !(loading || error);
    const cards = hasData ? <ShowCards movies={movies} /> : null;
    const spinner = loading ? <Spin size="large" /> : null;
    const errorMessage = error ? (
      <ErrorAlert message={notFoundError ? 'Nothing was found for your query' : 'Something went wrong'} />
    ) : null;

    return (
      <div className="app">
        <div className="app__movies-list">
          <Online>
            {spinner}
            {cards}
            {errorMessage}
          </Online>
          <Offline>
            <Alert
              message="You are not connected to the internet"
              type="error"
            />
          </Offline>
        </div>
      </div>
    );
  }
}

function ShowCards({ movies }) {
  return movies.map((movie) => (
    <Card
      key={movie.id}
      title={movie.title}
      date={movie.release_date}
      poster={movie.poster_path}
      overview={movie.overview}
    />
  ));
}

function ErrorAlert({ message }) {
  return (
    <Alert
      type="error"
      message={message}
      showIcon="true"
    />
  );
}
