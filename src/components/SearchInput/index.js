import { Component } from 'react';

import './searchInput.css';

export default class SearchInput extends Component {
  state = {
    value: '',
  };

  onInput = (event) => {
    const { value } = event.target;
    const { onSearch } = this.props;
    this.setState({ value });
    onSearch(value);
  };

  render() {
    const { value } = this.state;
    return (
      <input
        type="text"
        className="app__search-input"
        value={value}
        placeholder="Type to search..."
        onChange={this.onInput}
      />
    );
  }
}
