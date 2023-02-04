import { Component } from 'react';
import { Alert, Spin, Pagination, Tabs } from 'antd';
import { Offline, Online } from 'react-detect-offline';
import _ from 'lodash';

import SearchInput from '../SearchInput';
import Card from '../Card';
import MovieAPI from '../../service';
import GenresContext from '../../context';
import './app.css';

export default class App extends Component {
  state = {
    movies: {},
    ratedMovies: [],
    currentPage: 1,
    ratedPage: 1,
    totalItems: null,
    totalRated: null,
    loading: true,
    ratedLoading: true,
    error: false,
    notFoundError: false,
    query: '',
    genres: [],
    guestId: null,
  };

  movieAPI = new MovieAPI();

  constructor() {
    super();
    this.debouncedSearch = _.debounce(this.searchMovies, 1500);
    this.setStars = this.setStars.bind(this);
  }

  componentDidMount() {
    this.movieAPI
      .getGenres()
      .then((data) => {
        this.setState({ genres: data.genres });
      })
      .then(this.loadMovies());
    this.movieAPI
      .createGuestSession()
      .then((data) => {
        this.setState({ guestId: data.guest_session_id });
        return data.guest_session_id;
      })
      .then((id) => this.loadRatedMovies(id));
  }

  onMoviesLoaded = (movies) => {
    this.setState({
      movies,
      loading: false,
      error: false,
      notFoundError: false,
    });
    const { ratedMovies } = this.state;
    if (ratedMovies.length > 0) {
      let newMoviesData = movies;
      ratedMovies.forEach((rated) => {
        newMoviesData = movies.map((item) => {
          if (rated.id === item.id) {
            item.stars = rated.rating;
          }
          return item;
        });
      });
      this.setState({ movies: newMoviesData });
    }
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
  };

  onSearch = (value) => {
    this.debouncedSearch();
    this.setState({ query: value });
  };

  rateMovie = (value, id) => {
    const { guestId } = this.state;
    this.movieAPI
      .rateMovie(guestId, id, value)
      .then(() => this.loadRatedMovies(guestId))
      .then(() => this.setStars(id, value));
  };

  loadRatedMovies = (id, page) => {
    this.setState({ ratedLoading: true });
    this.movieAPI
      .getRatedMovies(id, page)
      .then((data) => {
        this.setState({ ratedMovies: data.results, totalRated: data.total_results });
      })
      .then(() => this.setState({ ratedLoading: false }));
  };

  setStars = (id, value) => {
    const { movies } = this.state;
    const newMoviesData = movies.map((movie) => {
      if (movie.id === id) {
        movie.stars = value;
      }
      return movie;
    });
    this.setState({ movies: newMoviesData });
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
    const {
      movies,
      currentPage,
      totalItems,
      loading,
      error,
      notFoundError,
      query,
      ratedMovies,
      genres,
      ratedLoading,
      totalRated,
      ratedPage,
      guestId,
    } = this.state;
    const hasData = !(loading || error);
    const cards = hasData ? (
      <ShowCards
        movies={movies}
        onRateMovie={this.rateMovie}
      />
    ) : null;
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
    const hasRatedMovies = !ratedLoading;
    const ratedSpinner = ratedLoading ? <Spin size="large" /> : null;
    const EmptyMessage =
      ratedMovies.length === 0 && !ratedLoading ? (
        <Alert
          type="info"
          message="You haven't rated movies yet"
        />
      ) : null;
    const ShowRatedMovies = hasRatedMovies ? <ShowCards movies={ratedMovies} /> : null;
    const ratedPagination = hasRatedMovies ? (
      <Pagination
        total={totalRated}
        current={ratedPage}
        pageSize={20}
        showSizeChanger={false}
        onChange={(page) => {
          this.loadRatedMovies(guestId, page);
          this.setState({ ratedPage: page });
        }}
      />
    ) : null;

    return (
      <div className="app">
        <GenresContext.Provider value={genres}>
          <Tabs
            defaultActiveKey="search"
            centered
            onChange={() => this.loadRatedMovies(guestId)}
          >
            <Tabs.TabPane
              tab="Search"
              key="search"
            >
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
            </Tabs.TabPane>
            <Tabs.TabPane
              tab="Rated"
              key="rated"
            >
              {EmptyMessage}
              <div className="rated-movies">{ShowRatedMovies}</div>
              {ratedSpinner}
              {ratedPagination}
            </Tabs.TabPane>
          </Tabs>
        </GenresContext.Provider>
      </div>
    );
  }
}

const ShowCards = ({ movies, onRateMovie }) =>
  movies.map((movie) => (
    <Card
      key={movie.id}
      title={movie.title}
      date={movie.release_date}
      poster={movie.poster_path}
      overview={movie.overview}
      rating={movie.vote_average.toFixed(1)}
      movieId={movie.id}
      onRateMovie={onRateMovie || null}
      stars={movie.stars || movie.rating || 0}
      movieGenres={movie.genre_ids}
      disabled={!!movie.rating}
    />
  ));

function ErrorAlert({ message }) {
  return (
    <Alert
      type="error"
      message={message}
      showIcon="true"
    />
  );
}
