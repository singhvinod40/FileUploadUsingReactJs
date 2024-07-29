import './App.css';
import React from 'react';
import LoginForm from './components/LoginForm/LoginForm';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute/PrivateRoute'; // Import PrivateRoute
import FileUpload from './components/uploadFile/FileUpload';
import Home from './components/Home/Home';

function App() {

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/login">
            <div className='login'> <LoginForm /> </div>
          </Route>
          <PrivateRoute path="/home" component={Home} />
          <Redirect from="/" to="/login" />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
