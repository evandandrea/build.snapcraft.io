import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import styles from './selectRepositoryRow.css';

class SelectRepositoryRow extends Component {
  render() {
    const {
      errorMsg,
      repository,
      onChange,
      checked,
      isEnabled
    } = this.props;

    const rowClass = classNames({
      [styles.repositoryRow]: true,
      [styles.error]: errorMsg,
      [styles.repositoryEnabled]: isEnabled
    });

    return (
      <div className={ rowClass } onChange={ onChange }>
        <input
          id={ repository.full_name }
          type="checkbox"
          checked={ checked || isEnabled }
          disabled={ isEnabled }
        />
        <div>
          <label htmlFor={ repository.full_name }>{repository.full_name}</label>
        </div>
        { errorMsg &&
          <div className={ styles.errorMessage }>
            { errorMsg }
          </div>
        }
      </div>
    );
  }
}

SelectRepositoryRow.defaultProps = {
  checked: false,
  isEnabled: false
};

SelectRepositoryRow.propTypes = {
  errorMsg: PropTypes.node,
  repository: PropTypes.shape({
    full_name: PropTypes.string.isRequired
  }).isRequired,
  checked: PropTypes.bool,
  isEnabled: PropTypes.bool,
  onChange: PropTypes.func
};

export default SelectRepositoryRow;
