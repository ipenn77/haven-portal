import { string } from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

import { routes, styles } from '../../constants';
import { getJwt, isAdmin } from '../../helpers/auth';
// import { scanDB } from '../../helpers/db';
import AppContext from '../../helpers/context';
import { AdminHeader } from '../components';
import ManageOptions from './ManageOptions';

const AdminHome = ({ url }) => {
  const { authData } = useContext(AppContext);
  const history = useHistory();
  const match = useRouteMatch();

  useEffect(() => {
    (async () => {
      if (!getJwt(authData)) {
        history.push(routes.userSignIn);
      }
      if (!isAdmin(authData)) {
        history.push(routes.userSignIn);
      }
      // const query = await scanDB({
      //   authData,
      //   tableName: 'options',
      // });
    })();
  }, [url]);

  return (
    <div className="admin-view">
      <AdminHeader />
      <div className={styles.contentSection}>
        <h3>Admin Home Page</h3>
      </div>

      <Switch>
        <Route path={`${match.path}${routes.manageOptions}`} component={ManageOptions} />
      </Switch>
    </div>
  );
};

AdminHome.defaultProps = {
  url: '',
};

AdminHome.propTypes = {
  url: string,
};

export default AdminHome;
