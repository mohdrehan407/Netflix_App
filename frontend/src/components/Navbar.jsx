import React, { useEffect, useState } from 'react';
import './Navbar.css';

const Navbar = ({ onSearch, onLogout }) => {
    const [show, handleShow] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    useEffect(() => {
        const scrollListener = () => {
            if (window.scrollY > 100) {
                handleShow(true);
            } else handleShow(false);
        };
        window.addEventListener("scroll", scrollListener);
        return () => {
            window.removeEventListener("scroll", scrollListener);
        };
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery);
        }
    };

    return (
        <div className={`nav ${show && "nav__black"}`}>
            <div className="nav__contents">
                <div className="nav__left">
                    <img
                        className="nav__logo"
                        src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
                        alt="Netflix Logo"
                    />
                    <div className="nav__links">
                        <span>Home</span>
                        <span>TV Shows</span>
                        <span>Movies</span>
                        <span>New & Popular</span>
                        <span>My List</span>
                    </div>
                </div>

                <div className="nav__right">
                    <form className={`nav__search ${isSearchActive ? 'active' : ''}`} onSubmit={handleSearchSubmit}>
                        <button type="button" onClick={() => setIsSearchActive(!isSearchActive)}>
                            <span role="img" aria-label="search">🔍</span>
                        </button>
                        <input
                            type="text"
                            placeholder="Titles, people, genres"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value === '') onSearch('');
                            }}
                            onBlur={() => {
                                if (searchQuery === '') setIsSearchActive(false);
                            }}
                        />
                    </form>
                    <img
                        onClick={onLogout}
                        className="nav__avatar"
                        src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                        alt="User Avatar"
                    />
                </div>
            </div>
        </div>
    );
}

export default Navbar;
