import React from 'react';
import './SearchResults.css';
import { IMAGE_BASE_URL } from '../services/api';

const SearchResults = ({ results, onMovieClick }) => {
    return (
        <div className="searchResults">
            <h1 className="searchResults__title">Results for you</h1>
            <div className="searchResults__grid">
                {results.map((movie) => (
                    movie.backdrop_path && (
                        <div
                            key={movie.id}
                            className="searchResults__item"
                            onClick={() => onMovieClick(movie)}
                        >
                            <img
                                src={`${IMAGE_BASE_URL}${movie.backdrop_path}`}
                                alt={movie.title || movie.name}
                            />
                            <div className="searchResults__itemInfo">
                                <p>{movie.title || movie.name}</p>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default SearchResults;
