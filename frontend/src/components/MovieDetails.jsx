import React, { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '../services/api';
import './MovieDetails.css';

const MovieDetails = ({ movieData, onClose }) => {
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [showTrailer, setShowTrailer] = useState(false);

    useEffect(() => {
        if (!movieData) return;

        async function fetchDetails() {
            setLoading(true);
            setShowTrailer(false);
            const data = await api.getMovieDetails(movieData.media_type || 'movie', movieData.id);
            const watchlist = await api.getWatchlist();
            setIsInWatchlist(watchlist.some(m => m.id === data.id));
            setMovie(data);
            setLoading(false);
        }
        fetchDetails();
    }, [movieData]);

    const toggleWatchlist = async () => {
        if (isInWatchlist) {
            await api.removeFromWatchlist(movie.id);
            setIsInWatchlist(false);
        } else {
            await api.addToWatchlist({
                id: movie.id,
                title: movie.title || movie.name,
                poster_path: movie.poster_path,
                backdrop_path: movie.backdrop_path,
                overview: movie.overview
            });
            setIsInWatchlist(true);
        }
    };

    if (!movieData) return null;

    const trailer = movie?.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
        movie?.videos?.results?.find(v => v.site === 'YouTube');
    const videoKey = trailer?.key;

    return (
        <div className="modal__overlay" onClick={onClose}>
            <div className="modal__content" onClick={e => e.stopPropagation()}>
                <button className="modal__close" onClick={onClose}>✕</button>

                {loading ? (
                    <div className="modal__loader">Loading...</div>
                ) : (
                    <>
                        <div
                            className="modal__banner"
                            style={{
                                backgroundImage: (showTrailer && videoKey) ? 'none' : `url("${IMAGE_BASE_URL}${movie?.backdrop_path}")`,
                                backgroundColor: 'black'
                            }}
                        >
                            {(showTrailer && videoKey) ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <>
                                    <div className="modal__bannerFade" />
                                    <div className="modal__bannerTitle">
                                        <h1>{movie?.title || movie?.name}</h1>
                                        <div className="modal__buttons">
                                            {videoKey ? (
                                                <button
                                                    className="banner__button banner__button--play"
                                                    onClick={() => setShowTrailer(true)}
                                                >
                                                    Play
                                                </button>
                                            ) : (
                                                <button className="banner__button banner__button--play" disabled style={{ opacity: 0.5 }}>
                                                    No Trailer
                                                </button>
                                            )}
                                            <button
                                                className={`banner__button banner__button--info ${isInWatchlist ? 'active' : ''}`}
                                                onClick={toggleWatchlist}
                                            >
                                                {isInWatchlist ? '✓' : '+'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal__info">
                            <div className="modal__infoLeft">
                                <div className="modal__meta">
                                    <span className="modal__match">98% Match</span>
                                    <span>{movie?.release_date?.split('-')[0]}</span>
                                    <span className="modal__rating">HD</span>
                                </div>
                                <p className="modal__overview">{movie?.overview}</p>
                            </div>
                            <div className="modal__infoRight">
                                <p><span>Cast:</span> {movie?.credits?.cast?.slice(0, 3).map(c => c.name).join(', ')}</p>
                                <p><span>Genres:</span> {movie?.genres?.map(g => g.name).join(', ')}</p>
                                <p><span>This movie is:</span> Exciting, Emotional</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MovieDetails;
