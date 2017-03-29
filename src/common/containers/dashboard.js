import React, { Component } from 'react';
import Helmet from 'react-helmet';

import RepositoriesHome from '../components/repositories-home';
import UserAvatar from '../components/user-avatar';
import styles from './container.css';

class Dashboard extends Component {
  render() {
    return (
      <div className={ styles.container }>
        <Helmet
          title='Home'
        />
        <UserAvatar />
        <RepositoriesHome />
      </div>
    );
  }
}

export default Dashboard;