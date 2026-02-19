import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import MovieDetails from './components/MovieDetails';
import Login from './components/Login';
import SearchResults from './components/SearchResults';
import api from './services/api';
import './index.css';

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Persistence: Check for user on load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    // Guarantee we always have a valid user object
    const safeUser = userData && typeof userData === 'object'
      ? { email: userData.email || 'user', uname: userData.uname || '', uid: userData.uid || '', phone: userData.phone || '' }
      : { email: 'user' };
    setUser(safeUser);
    localStorage.setItem('user', JSON.stringify(safeUser));
    // Redirect to main app after successful login
    navigate('/');
  };

  const handleSearch = async (query) => {
    if (!query) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await api.searchMovies(query);
    setSearchResults(results);
  };

  const handleLogout = () => {
    api.logout();
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // Protected route: redirect unauthenticated users to login page
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Login route: redirect authenticated users to main app
  const LoginRoute = ({ children }) => {
    if (user) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginRoute>
            <Login onLoginSuccess={handleLoginSuccess} />
          </LoginRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="app">
              <Navbar onSearch={handleSearch} onLogout={handleLogout} />

              {isSearching ? (
                <SearchResults results={searchResults} onMovieClick={setSelectedMovie} />
              ) : (
                <>
                  <Banner onMovieClick={setSelectedMovie} />

                  <Row title="My List" fetchType="watchlist" onMovieClick={setSelectedMovie} />

                  <Row
                    title="NETFLIX ORIGINALS"
                    fetchType="originals"
                    isLargeRow={true}
                    onMovieClick={setSelectedMovie}
                  />
                  <Row title="Trending Now" fetchType="trending" onMovieClick={setSelectedMovie} />
                  <Row title="Top Rated" fetchType="top_rated" onMovieClick={setSelectedMovie} />
                  <Row title="Action Movies" fetchType="action" onMovieClick={setSelectedMovie} />
                  <Row title="Comedy Movies" fetchType="comedy" onMovieClick={setSelectedMovie} />
                  <Row title="Horror Movies" fetchType="horror" onMovieClick={setSelectedMovie} />
                  <Row title="Romance Movies" fetchType="romance" onMovieClick={setSelectedMovie} />
                  <Row title="Documentaries" fetchType="documentaries" onMovieClick={setSelectedMovie} />
                </>
              )}

              <MovieDetails
                movieData={selectedMovie}
                onClose={() => setSelectedMovie(null)}
              />

              <footer style={{
                padding: "50px",
                backgroundColor: "#111",
                color: "#757575",
                fontSize: "13px",
                textAlign: "center"
              }}>
                <p>© 2026 Netflix Clone - Build Challenge</p>
              </footer>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
