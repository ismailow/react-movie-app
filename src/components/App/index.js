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
    totalItems: null,
    loading: true,
    error: false,
    notFoundError: false,
    query: '',
    genres: [],
    // guestId: null,
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
    if (localStorage.length < 1) {
      localStorage.setItem('ratedMovies', JSON.stringify([]));
    } else {
      this.setState({ ratedMovies: JSON.parse(localStorage.getItem('ratedMovies')) });
    }
    // this.movieAPI
    //   .createGuestSession()
    //   .then((data) => {
    //     this.setState({ guestId: data.guest_session_id });
    //     return data.guest_session_id;
    //   })
    //   .then((id) => this.loadRatedMovies(id));
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
  };

  onSearch = (value) => {
    this.debouncedSearch();
    this.setState({ query: value });
  };

  rateMovie = (value, id) => {
    const { movies } = this.state;
    // this.movieAPI
    //   .rateMovie(guestId, id, value)
    //   .then(() => this.loadRatedMovies(guestId))
    //   .then(() => this.setStars());
    const ratedMoviesArray = JSON.parse(localStorage.getItem('ratedMovies'));
    const isRated = ratedMoviesArray.some((item) => item.id === id);
    if (isRated) {
      const newRatedMoviesArray = ratedMoviesArray.map((item) => {
        if (item.id === id) {
          item.rating = value;
        }
        return item;
      });
      this.setState({ ratedMovies: newRatedMoviesArray });
    } else {
      const [ratedMovie] = movies.filter((item) => item.id === id);
      ratedMovie.rating = value;
      ratedMoviesArray.push(ratedMovie);
      localStorage.setItem('ratedMovies', JSON.stringify(ratedMoviesArray));
      this.setState({ ratedMovies: ratedMoviesArray });
    }
    this.setStars();
  };

  // loadRatedMovies = (id) => {
  //   console.log('loading');
  //   this.movieAPI.getRatedMovies(id).then((data) => this.setState(() => ({ ratedMovies: data.results })));
  // };

  setStars = () => {
    const { ratedMovies } = this.state;
    this.setState(({ movies }) => {
      const newMovies = movies.map((searchItems) => {
        if (ratedMovies.length > 0) {
          ratedMovies.forEach((ratedItems) => {
            if (searchItems.id === ratedItems.id) {
              searchItems.rating = ratedItems.rating;
            }
          });
        }
        return searchItems;
      });
      return {
        movies: newMovies,
      };
    });
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
      .then(this.setStars)
      .catch((err) => {
        if (err.name === 'NotFoundError') {
          this.onNotFoundError();
        } else {
          this.onError();
        }
      });
  }

  render() {
    const { movies, currentPage, totalItems, loading, error, notFoundError, query, ratedMovies, genres } = this.state;
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
    const hasRatedMovies = ratedMovies.length > 0;
    const EmptyMessage = !hasRatedMovies ? (
      <Alert
        type="info"
        message="you haven't rated movies yet"
      />
    ) : null;
    const ShowRatedMovies = hasRatedMovies ? <ShowCards movies={ratedMovies} /> : null;

    return (
      <div className="app">
        <GenresContext.Provider value={genres}>
          <Tabs
            defaultActiveKey="search"
            centered
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
      stars={movie.rating || 0}
      movieGenres={movie.genre_ids}
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
