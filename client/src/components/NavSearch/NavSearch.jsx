import { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { searchBooksAndCategories } from '../../services/api';
import './NavSearch.css';

function NavSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const fetchResults = async (value) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }
    try {
      const data = await searchBooksAndCategories(value);
      setResults(data.data || []);
    } catch (err) {
      console.error('Error fetching search results', err);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => fetchResults(value), 500),
    []
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSelect = (item) => {
    setQuery('');
    setResults([]);
    if (item.type === 'book') {
      window.location.href = `/home/categories/${item.category_id}/books/${item.id}`;
    } else if (item.type === 'category') {
      window.location.href = `/home/categories/${item.id}`;
    }
  };

  return (
    <div className="nav-search">
      <div className="search-div">
        <input
          type="text"
          placeholder="search books or categories..."
          value={query}
          onChange={handleChange}
        />
        <img className="icon" src="\src\assets\icon-search.png"/>
      </div>
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((item) => (
            <li
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className="search-item"
            >
              {item.type === 'book' ? `📚 ${item.title}` : `📂 ${item.name}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NavSearch;
