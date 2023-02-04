import format from 'date-fns/format';
import { Rate } from 'antd';

import GenresContext from '../../context';

import './card.css';

function Card(props) {
  function trimOverview(text) {
    let trimmedStr = text.split(' ');
    if (trimmedStr.length > 35) {
      trimmedStr = trimmedStr.slice(0, 36);
    }
    return `${trimmedStr.join(' ')}...`;
  }

  const { title, date, poster, overview, rating, movieId, onRateMovie, stars, movieGenres, disabled } = props;

  const disableHover = {
    cursor: 'default',
  };

  function getRatingColor() {
    if (rating <= 3) {
      return '#E90000';
    } else if (rating > 3 && rating < 5) {
      return '#E97E00';
    } else if (rating > 5 && rating < 7) {
      return '#E9D100';
    } else {
      return '#66E900';
    }
  }

  function setGenres(genres) {
    return movieGenres.map((item) => {
      let genreName = '';
      genres.forEach((genre) => {
        if (genre.id === item) {
          genreName = genre.name;
        }
      });
      return (
        <li
          className="card__genre"
          key={item}
        >
          {genreName}
        </li>
      );
    });
  }

  return (
    <GenresContext.Consumer>
      {(genres) => (
        <div className="card">
          <img
            className="card__poster"
            src={`https://image.tmdb.org/t/p/w500/${poster}`}
            alt="Movie poster"
          />
          <div className="card__info">
            <div className="card__header">
              <h3 className="card__title">{title}</h3>
              <div
                className="card__rating"
                style={{ borderColor: getRatingColor() }}
              >
                {rating}
              </div>
            </div>
            <p className="card__date">{format(new Date(date), 'MMMM d, yyyy')}</p>
            <ul className="card__genres">{setGenres(genres)}</ul>
            <p className="card__description">{trimOverview(overview)}</p>
            <Rate
              style={disabled ? disableHover : null}
              count={10}
              onChange={(value) => {
                onRateMovie(value, movieId);
              }}
              allowHalf
              value={stars}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </GenresContext.Consumer>
  );
}

export default Card;
