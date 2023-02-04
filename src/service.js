import NotFoundError from './errors/notFoundError';

export default class MovieAPI {
  apiKey = '31e0e9c91112b9de4b7b778129587021';

  baseURL = 'https://api.themoviedb.org/3';

  async getMovies(query, page) {
    const request = await fetch(
      `${this.baseURL}/search/movie?api_key=${this.apiKey}&language=en-US&query=${query || 'return'}&page=${
        page || 1
      }&include_adult=false`
    );

    if (!request.ok) {
      throw new Error(`Error ${request.status}`);
    }

    const response = await request.json();

    if (response.results.length === 0) {
      throw new NotFoundError();
    }

    return response;
  }

  async createGuestSession() {
    const request = await fetch(`${this.baseURL}/authentication/guest_session/new?api_key=${this.apiKey}`);
    const response = await request.json();
    return response;
  }

  async rateMovie(guestId, movieId, rateValue) {
    const requestBody = {
      value: rateValue,
    };

    const request = await fetch(
      `${this.baseURL}/movie/${movieId}/rating?api_key=${this.apiKey}&guest_session_id=${guestId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const response = await request.json();
    return response;
  }

  async getRatedMovies(guestId, page) {
    const request = await fetch(
      `${this.baseURL}/guest_session/${guestId}/rated/movies?api_key=${
        this.apiKey
      }&language=en-US&sort_by=created_at.asc&&page=${page || 1}`
    );

    if (!request.ok) {
      throw new Error(`Error ${request.status}`);
    }

    const response = await request.json();
    return response;
  }

  async getGenres() {
    const request = await fetch(`${this.baseURL}/genre/movie/list?api_key=${this.apiKey}&language=en-US`);
    const response = await request.json();
    return response;
  }
}
