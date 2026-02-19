import React, { useState, useEffect } from 'react';
import api, { IMAGE_BASE_URL } from '../services/api';
import './Banner.css';

const Banner = ({ onMovieClick }) => {
    const [movie, setMovie] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const movies = await api.getMovies('trending');
            const randomMovie = movies[Math.floor(Math.random() * movies.length)];
            setMovie(randomMovie);
        }
        fetchData();
    }, []);

    function truncate(string, n) {
        return string?.length > n ? string.substr(0, n - 1) + '...' : string;
    }

    return (
        <header
            className="banner"
            style={{
                backgroundSize: "cover",
                backgroundImage: `url("${IMAGE_BASE_URL}${movie?.backdrop_path}")`,
                backgroundPosition: "top center",
            }}
        >
            <div className="banner__contents">
                <h1 className="banner__title">
                    {movie?.title || movie?.name || movie?.original_name}
                </h1>

                <div className="banner__buttons">
                    <button
                        className="banner__button banner__button--play"
                        onClick={() => onMovieClick(movie)}
                    >
                        Play
                    </button>
                    <button
                        className="banner__button banner__button--info"
                        onClick={() => onMovieClick(movie)}
                    >
                        More Info
                    </button>
                </div>

                <h1 className="banner__description">
                    {truncate(movie?.overview, 150)}
                </h1>
            </div>

            <div className="banner--fadeBottom" />
        </header>
    );
};

export default Banner;
