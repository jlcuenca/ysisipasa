import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authService from './services/authService';

// Screens
import Welcome from './screens/Welcome';
import QuestionnaireFlow from './screens/QuestionnaireFlow';
import Results from './screens/Results';
import Profile from './screens/Profile';

// Layout
import Header from './components/Layout/Header';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    return (
        <div className="app">
            {user && <Header user={user} onLogout={() => setUser(null)} />}

            <Routes>
                <Route path="/" element={<Welcome onUserSet={setUser} />} />
                <Route
                    path="/questionnaire/:category?"
                    element={user ? <QuestionnaireFlow /> : <Navigate to="/" />}
                />
                <Route
                    path="/results"
                    element={user ? <Results /> : <Navigate to="/" />}
                />
                <Route
                    path="/profile"
                    element={user ? <Profile /> : <Navigate to="/" />}
                />
            </Routes>
        </div>
    );
}

export default App;
