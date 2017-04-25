import React, { Component } from 'react';

import styles from './footer.css';

export default class Footer extends Component {
  render() {
    return (
      <div className={ styles.footer }>
        <div className={ styles.container }>
          <div className={ styles.social }>
            <h3 className={ styles.heading }>Follow us</h3>
            <ul className={ styles.socialList }>
              <li className={ styles.socialListItem }>
                <a href="https://twitter.com/snapcraftio" className={ styles.socialListItemTwitter }>Share on Twitter</a>
              </li>
              <li className={ styles.socialListItem }>
                <a href="https://plus.google.com/+SnapcraftIo" className={ styles.socialListItemGoogle }>Share on Google plus</a>
              </li>
              <li className={ styles.socialListItem }>
                <a href="https://www.facebook.com/snapcraftio" className={ styles.socialListItemFacebook }>Share on Facebook</a>
              </li>
            </ul>
          </div>
          <p className={ styles.copyright }>© 2017 Canonical Ltd. Ubuntu and Canonical are registered trademarks of Canonical Ltd.</p>
          <p><a href="https://www.ubuntu.com/legal">Legal information</a> · <a href="https://github.com/canonical-ols/build.snapcraft.io/issues/new">Report a bug on this site</a> · Help us improve Snapcraft by <a href="https://docs.google.com/forms/d/e/1FAIpQLSfCbGjGlCHCx3CdjH6Ls2nPd37nWFzlBoVXq1hAC9V9cYz2AA/viewform">participating in user testing</a></p>
        </div>
      </div>
    );
  }
}
