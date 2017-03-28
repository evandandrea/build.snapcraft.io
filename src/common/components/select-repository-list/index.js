import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { conf } from '../../helpers/config';
import { buildRepositories } from '../../actions/repositories';
import SelectRepositoryRow from '../select-repository-row';
import Spinner from '../spinner';
import PageLinks from '../page-links';
import Button, { LinkButton } from '../vanilla/button';
import { HeadingThree } from '../vanilla/heading';
import { toggleRepositorySelection, fetchUserRepositories } from '../../actions/repositories';
import { getSelectedRepositories, getRepositoriesToBuild, getEnabledRepositories } from '../../selectors/index.js';
import styles from './styles.css';

// loading container styles not to duplicate .spinner class
import { spinner as spinnerStyles } from '../../containers/container.css';

const SNAP_NAME_NOT_REGISTERED_ERROR_CODE = 'snap-name-not-registered';

export class SelectRepositoryListComponent extends Component {

  componentDidMount() {
    // TODO clear any repository-build state?
    this.deselectAllRepositories(this.props.selectedRepositories);
  }

  deselectAllRepositories(selectedRepositories) {
    selectedRepositories.map(id => toggleRepositorySelection(id));
  }

  componentWillReceiveProps(nextProps) {
    // XXX DONT FORGET ME!!!
    // XXX move to selector
    const repositoriesStatus = nextProps.repositoriesStatus;
    const ids = Object.keys(repositoriesStatus);
    if (ids.length && ids.every((id) => repositoriesStatus[id].success)) {
      this.props.router.push('/dashboard');
    }
  }

  // XXX this can be moved too select-repository-row as the error prop is on
  // the repository object passed to it
  getSnapNotRegisteredMessage(snapName) {
    const devportalUrl = conf.get('STORE_DEVPORTAL_URL');
    const registerNameUrl = `${devportalUrl}/click-apps/register-name/` +
                            `?name=${encodeURIComponent(snapName)}`;

    return <span>
      The name provided in the snapcraft.yaml file ({snapName}) is not
      registered in the store.
      Please <a href={registerNameUrl}>register it</a> before trying
      again.
    </span>;
  }

  // XXX this can be moved too select-repository-row as the error prop is on
  // the repository object passed to it
  getErrorMessage(error) {
    if (error) {
      const payload = error.json.payload;
      if (payload.code === SNAP_NAME_NOT_REGISTERED_ERROR_CODE) {
        return this.getSnapNotRegisteredMessage(payload.snap_name);
      } else {
        return error.message;
      }
    }
  }

  renderRepository(id) {
    const repository = this.props.entities.repos[id];
    const { full_name } = repository;

    const isEnabled = !!this.props.enabledRepositories[id];

    return (
      <SelectRepositoryRow
        key={ `repo_${full_name}` }
        repository={ repository }
        onChange={ this.onSelectRepository.bind(this, id) }
        errorMsg= { this.getErrorMessage(repository.__error) }
        isEnabled={ isEnabled }
      />
    );
  }

  onSelectRepository(id) {
    this.props.dispatch(toggleRepositorySelection(id));
  }

  // XXX it's not a submit, there's no form, rename to ~handleAddButtonClick
  onSubmit() {
    const { repositoriesToBuild } = this.props;

    console.log(repositoriesToBuild);

    // TODO else "You have not selected any repositories"
    if (repositoriesToBuild.length) {
      this.props.dispatch(buildRepositories(repositoriesToBuild));
    }
  }

  onPageLinkClick(pageNumber) {
    this.props.dispatch(fetchUserRepositories(pageNumber));
  }

  pageSlice(array, pageLinks) {
    const PAGE_SIZE = 30; // XXX move to config or state
    const { next, prev } = pageLinks;
    let out = [];

    if (next) {
      out = array.slice((next - 2) * PAGE_SIZE, (next - 1) * PAGE_SIZE - 1);
    } else if (prev) {
      out = array.slice(prev * 30);
    } else {
      out = array;
    }

    return out;
  }

  render() {
    const { selectedRepositories } = this.props;
    const { ids, error, isFetching, pageLinks } = this.props.repositories;
    const pagination = this.renderPageLinks(pageLinks);

    let renderedRepos = null;

    // XXX if not success, then what? we lose the previously good list of repos?
    if (!error) {

      renderedRepos = this.pageSlice(ids, pageLinks)
        .map((id) => {
          return this.renderRepository(id);
        });
    } else {
      // TODO show error message and keep old repo list
    }

    return (
      <div>
        { isFetching &&
          <div className={ spinnerStyles }><Spinner /></div>
        }
        { renderedRepos }
        { pagination }
        <div className={ styles.footer }>
          <HeadingThree>
            { selectedRepositories.length } selected
          </HeadingThree>
          <div className={ styles['footer-right'] }>
            <div className={ styles['button-wrapper'] }>
              { ids && ids.length > 0 &&
                <LinkButton appearance="neutral" to="/dashboard">
                  Cancel
                </LinkButton>
              }
            </div>
            <div className={ styles['button-wrapper'] }>
              <Button onClick={ this.onSubmit.bind(this) } appearance={ 'positive' }>
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderPageLinks(pageLinks) {
    if (pageLinks) {
      return (
        <div className={ styles['page-links-container'] }>
          <PageLinks { ...pageLinks } onClick={ this.onPageLinkClick.bind(this) } />
        </div>
      );
    }
  }
}

SelectRepositoryListComponent.propTypes = {
  dispatch: PropTypes.func.isRequired,
  entities: PropTypes.object.isRequired,
  onSelectRepository: PropTypes.func,
  repositories: PropTypes.object,
  repositoriesStatus: PropTypes.object,
  router: PropTypes.object.isRequired,
  snaps: PropTypes.object,
  selectedRepositories: PropTypes.array,
  repositoriesToBuild: PropTypes.array,
  enabledRepositories: PropTypes.object
};

function mapStateToProps(state) {
  const {
    snaps,
    entities,
    repositories,
    repositoriesStatus
  } = state;

  return {
    snaps,
    entities,
    repositories, // ?repository-pagination
    repositoriesStatus,
    selectedRepositories: getSelectedRepositories(state),
    repositoriesToBuild: getRepositoriesToBuild(state),
    enabledRepositories: getEnabledRepositories(state)
  };
}

export default connect(mapStateToProps)(withRouter(SelectRepositoryListComponent));
