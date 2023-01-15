import NotFoundError from './errors/notFoundError';

export default class MovieAPI {
  apiKey = '31e0e9c91112b9de4b7b778129587021';

  baseURL = 'https://api.themoviedb.org/3';

  async getMovies(query, page) {
    const response = await fetch(
      `${this.baseURL}/search/movie?api_key=${this.apiKey}&language=en-US&query=${query || 'return'}&page=${
        page || 1
      }&include_adult=false`
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const request = await response.json();

    if (request.results.length === 0) {
      throw new NotFoundError();
    }

    return request;
  }
}
