import format from 'date-fns/format';
import './card.css';

function Card(props) {
  function trimOverview(text) {
    let trimmedStr = text.split(' ');
    if (trimmedStr.length > 35) {
      trimmedStr = trimmedStr.slice(0, 36);
    }
    return `${trimmedStr.join(' ')}...`;
  }

  const { title, date, poster, overview } = props;
  return (
    <div className="card">
      <img
        className="card__poster"
        src={`https://image.tmdb.org/t/p/w500/${poster}`}
        alt="Movie poster"
      />
      <div className="card__info">
        <h3 className="card__title">{title}</h3>
        <p className="card__date">{format(new Date(date), 'MMMM d, yyyy')}</p>
        <ul className="card__genres">
          <li className="card__genre">Action</li>
          <li className="card__genre">Drama</li>
        </ul>
        <p className="card__description">{trimOverview(overview)}</p>
      </div>
    </div>
  );
}

export default Card;
