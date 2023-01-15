import { Component } from 'react';
import { Alert, Spin, Pagination } from 'antd';
import { Offline, Online } from 'react-detect-offline';
import _ from 'lodash';

import SearchInput from '../SearchInput';
import Card from '../Card';
import MovieAPI from '../../service';
import './app.css';

export default class App extends Component {
  state = {
    movies: {},
    currentPage: 1,
    totalItems: null,
    loading: true,
    error: false,
    notFoundError: false,
    query: '',
  };

  movieAPI = new MovieAPI();

  constructor() {
    super();
    this.debouncedSearch = _.debounce(this.searchMovies, 1500);
  }

  componentDidMount() {
    this.loadMovies();
  }

  onMoviesLoaded = (movies) => {
    this.setState({
      movies,
      loading: false,
      error: false,
      notFoundError: false,
    });
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

  searchMovies = () => {
    const { query } = this.state;
    this.setState({ loading: true });
    this.loadMovies(query);
    console.log(query);
  };

  onSearch = (value) => {
    this.debouncedSearch();
    this.setState({ query: value });
  };

  loadMovies(query, page) {
    this.movieAPI
      .getMovies(query, page)
      .then((data) => {
        this.setState({ totalItems: data.total_results, currentPage: page || 1 });
        return data;
      })
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
    const { movies, currentPage, totalItems, loading, error, notFoundError, query } = this.state;
    const hasData = !(loading || error);
    const cards = hasData ? <ShowCards movies={movies} /> : null;
    const spinner = loading ? <Spin size="large" /> : null;
    const errorMessage = error ? (
      <ErrorAlert message={notFoundError ? 'Nothing was found for your query' : 'Something went wrong'} />
    ) : null;
    const pagination = hasData ? (
      <Pagination
        total={totalItems}
        current={currentPage}
        pageSize={movies.length}
        showSizeChanger={false}
        onChange={(page) => {
          this.loadMovies(query, page);
        }}
      />
    ) : null;

    return (
      <div className="app">
        <SearchInput onSearch={this.onSearch} />
        <div className="app__movies-list">
          <Online>
            {spinner}
            {cards}
            {errorMessage}
            {pagination}
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
