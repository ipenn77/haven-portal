import { get } from 'lodash';
import { func, string } from 'prop-types';
import React, { Component } from 'react';
import { cx } from 'react-emotion';

import { styles } from '../../constants';
import { content, tab, tabset } from '../../constants/styles/tabset';

import AppContext from '../../helpers/context';
import { deleteItem, scanDB } from '../../helpers/db';

import { Spinner } from '../components';

const ADD_NEW = 'add-new';
const MANAGE = 'manage';

class Tabset extends Component {
  static contextType = AppContext;

  state = {
    addNewIsActive: false,
    dataItems: [],
    dbError: null,
    editIsActive: false,
    loading: true,
    selectedItem: null,
    successMessage: '',
  };

  constructor(props) {
    super(props);

    this.deleteItem = this.deleteItem.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.setEditIsActive = this.setEditIsActive.bind(this);
    this.setSelectedItem = this.setSelectedItem.bind(this);
    this.showEditView = this.showEditView.bind(this);
    this.updateSuccessMessage = this.updateSuccessMessage.bind(this);
  }

  componentDidMount() {
    this.refreshData();
  }

  get editDeleteBlock() {
    return (
      <div>
        <a href="#edit" onClick={this.showEditView(true)}>
          Edit
        </a>
        <span> | </span>
        <a href="#delete" onClick={this.deleteItem}>
          Delete
        </a>
      </div>
    );
  }

  async setSelectedItem(item) {
    await this.setState({ selectedItem: item });
  }

  setEditIsActive(active) {
    this.setState({ editIsActive: active });
  }

  getTabState(tabName) {
    const { addNewIsActive } = this.state;
    if ((tabName === ADD_NEW && addNewIsActive) || (tabName === MANAGE && !addNewIsActive)) {
      return 'active';
    }
    return '';
  }

  async deleteItem() {
    const { authData } = this.context;
    const { primaryKey, tableName } = this.props;
    const { selectedItem } = this.state;
    if (
      window.confirm('Are you sure you want to delete this item? This operation cannot be undone.')
    ) {
      const item = {
        [primaryKey]: get(selectedItem, primaryKey, null),
      };

      try {
        await deleteItem({ authData, item, tableName });
        this.setState({
          selectedItem: null,
          successMessage: 'Your item was successfully deleted',
        });
        this.refreshData();
      } catch (e) {
        this.setState({ dbError: `Something went wrong: ${e.message}` });
      }
    }
  }

  async refreshData() {
    const { authData } = this.context;
    const { tableName } = this.props;

    this.setState(
      {
        dataItems: [],
        dbError: null,
        selectedItem: null,
      },
      async () => {
        try {
          const data = await scanDB({
            authData,
            tableName,
          });
          this.setState({ dataItems: data.Items, loading: false });
        } catch (e) {
          this.setState({ dbError: `An error occured: ${e.message}`, loading: false });
        }
      }
    );
  }

  updateTabState(tabName) {
    const { addNewIsActive } = this.state;
    return () => {
      if ((tabName === ADD_NEW && !addNewIsActive) || (tabName === MANAGE && addNewIsActive)) {
        const newState = !addNewIsActive;
        this.setState({ addNewIsActive: newState, dbError: null, successMessage: '' });
      }
    };
  }

  updateSuccessMessage(message) {
    this.setState({ successMessage: message });
  }

  showEditView(shouldShow = true) {
    return () => this.setState({ editIsActive: shouldShow });
  }

  render() {
    const { WrappedComponent } = this.props;
    const {
      addNewIsActive,
      dataItems,
      dbError,
      editIsActive,
      loading,
      selectedItem,
      successMessage,
    } = this.state;

    return (
      <>
        <div className={tabset}>
          <div
            className={cx(tab, this.getTabState(MANAGE))}
            onClick={this.updateTabState(MANAGE)}
            onKeyPress={this.updateTabState(MANAGE)}
            role="button"
            tabIndex={0}
          >
            Manage
          </div>
          <div
            className={cx(tab, this.getTabState(ADD_NEW))}
            onClick={this.updateTabState(ADD_NEW)}
            onKeyPress={this.updateTabState(ADD_NEW)}
            role="button"
            tabIndex={0}
          >
            Add New
          </div>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className={content}>
            <div className={styles.messageContainer}>
              {dbError && <p className={styles.errorText}>{dbError}</p>}
            </div>
            <div className={styles.messageContainer}>
              {successMessage && <p className={styles.successText}>{successMessage}</p>}
            </div>
            {selectedItem && !editIsActive && !addNewIsActive && this.editDeleteBlock}
            <WrappedComponent
              addNewIsActive={addNewIsActive}
              dataItems={dataItems}
              deleteItem={this.deleteItem}
              editIsActive={editIsActive}
              refreshData={this.refreshData}
              selectedItem={selectedItem}
              setEditIsActive={this.setEditIsActive}
              setSelectedItem={this.setSelectedItem}
              showEditView={this.showEditView}
              updateSuccessMessage={this.updateSuccessMessage}
            />
          </div>
        )}
      </>
    );
  }
}

Tabset.propTypes = {
  primaryKey: string.isRequired,
  tableName: string.isRequired,
  WrappedComponent: func.isRequired,
};

const withTabset = (props) => {
  return () => <Tabset {...props} />;
};

export default withTabset;
