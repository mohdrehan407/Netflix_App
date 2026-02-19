import React, { useState, useEffect } from 'react';
import api, { POSTER_BASE_URL } from '../services/api';
import './Row.css';

const Row = ({ title, fetchType, isLargeRow = false, onMovieClick }) => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const results = await api.getMovies(fetchType);
            setMovies(results);
        }
        fetchData();
    }, [fetchType]);

    return (
        <div className="row">
            <h2 className="row__title">{title}</h2>

            <div className="row__posters">
                {movies?.map(movie => (
                    ((isLargeRow && movie.poster_path) || (!isLargeRow && movie.backdrop_path)) && (
                        <div
                            key={movie.id}
                            className="row__posterWrapper"
                            onClick={() => onMovieClick({ ...movie, media_type: movie.media_type || (fetchType === 'originals' ? 'tv' : 'movie') })}
                        >
                            <img
                                className={`row__poster ${isLargeRow && "row__posterLarge"}`}
                                src={`${POSTER_BASE_URL}${isLargeRow ? movie.poster_path : movie.backdrop_path}`}
                                alt={movie.name}
                            />
                            <div className="row__posterInfo">
                                <p>{movie?.title || movie?.name || movie?.original_name}</p>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default Row;
