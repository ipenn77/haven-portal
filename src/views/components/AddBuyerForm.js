import { isEmpty, noop } from 'lodash';
import { arrayOf, func, shape } from 'prop-types';
import React, { Fragment, useState } from 'react';

import { styles } from '../../constants';
import { addNew } from '../../constants/styles/manageUsers';
import { buttonContainer, formContainer, formSection } from '../../constants/styles/manageOptions';

import { ValidationItem, validateItems } from '../../helpers/formValidation';

import {
  Button,
  CheckboxInput,
  DropdownMenu,
  DropdownOption,
  Spinner,
  TextArea,
  TextInput,
} from '.';

const AddBuyerForm = ({ onCancel, orgs, refresh }) => {
  const [property, setProperty] = useState('');
  const [salutation, setSalutation] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [email, setEmail] = useState('');
  const [salesValue, setSalesValue] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [actionedBy, setActionedBy] = useState('');
  const [sendInvite, setSendInvite] = useState(false);
  const [demoConsumer, setDemoConsumer] = useState(false);

  const [buttonIsDisabled, setButtonIsDisabled] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const setValue = (setState) => {
    return (e) => {
      setState(e.target.value);
    };
  };

  const setCheckboxValue = (setState) => {
    return (e) => {
      setState(e.target.checked);
    };
  };

  const clearState = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
  };

  const handleSubmit = async (e) => {
    setButtonIsDisabled(true);
    setLoading(true);
    setValidationErrors({});
    e.preventDefault();

    const validationObj = [
      new ValidationItem({
        displayName: 'First Name',
        fieldName: 'firstName',
        isRequiredString: true,
        value: firstName,
      }),
      new ValidationItem({
        displayName: 'Last Name',
        fieldName: 'lastName',
        isRequiredString: true,
        value: lastName,
      }),
      new ValidationItem({
        displayName: 'Email',
        fieldName: 'email',
        isRequiredString: true,
        value: email,
      }),
    ];

    const errors = validateItems({ items: validationObj });

    if (!isEmpty(errors)) {
      setValidationErrors(errors);
      setButtonIsDisabled(false);
      setLoading(false);
      return;
    }

    try {
      refresh();
      setButtonIsDisabled(false);
      setSuccessMsg('User successfully created!');
      clearState();
    } catch (err) {
      setFormError(`Something went wrong: ${err}`);
      setButtonIsDisabled(false);
    }

    setLoading(false);
  };

  return (
    <div>
      <h3>Add New Buyer</h3>
      <div className={styles.messageContainer}>
        {formError && <p className={styles.errorText}>{formError}</p>}
        {successMsg && <p className={styles.successText}>{successMsg}</p>}
      </div>
      <div className={addNew}>
        <a href="#manage-buyers" onClick={onCancel}>
          {'<< Back'}
        </a>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <form className={formContainer} onSubmit={handleSubmit}>
          <div className={formSection}>
            <DropdownMenu
              id="property"
              label="Property"
              onChange={setValue(setProperty)}
              value={property}
            >
              <DropdownOption text="" value="" />
              {orgs &&
                orgs.map((org) => (
                  <Fragment key={org.OrgId}>
                    <DropdownOption text={org.Name} value={org.OrgId} />
                  </Fragment>
                ))}
            </DropdownMenu>
            <TextInput
              labelText="Salutation"
              onChange={setValue(setSalutation)}
              value={salutation}
            />
            <TextInput
              error={validationErrors.firstName}
              labelText="First Name"
              onChange={setValue(setFirstName)}
              value={firstName}
              Suffix
            />
            <TextInput
              error={validationErrors.lastName}
              labelText="Last Name"
              onChange={setValue(setLastName)}
              value={lastName}
            />
            <TextInput labelText="Suffix" onChange={setValue(setSuffix)} value={suffix} />
            <TextInput
              error={validationErrors.email}
              labelText="Email Address"
              onChange={setValue(setEmail)}
              value={email}
            />
            <TextInput
              labelText="Sales Value"
              onChange={setValue(setSalesValue)}
              value={salesValue}
            />
            <TextInput
              labelText="Invoice Number"
              onChange={setValue(setInvoiceNumber)}
              value={invoiceNumber}
            />
          </div>

          <div className={formSection}>
            <TextArea labelText="Notes" onChange={setValue(setNotes)} value={notes} />
            <TextInput
              labelText="Actioned By"
              onChange={setValue(setActionedBy)}
              value={actionedBy}
            />
            <CheckboxInput
              checked={sendInvite}
              label="Send Invite?"
              onChange={noop}
              onClick={setCheckboxValue(setSendInvite)}
              value="sendInvite"
            />
            <CheckboxInput
              checked={demoConsumer}
              label="Demo Consumer?"
              onChange={noop}
              onClick={setCheckboxValue(setDemoConsumer)}
              value="demoConsumer"
            />

            <div className={buttonContainer}>
              <Button className={styles.buttonSecondary} onClick={onCancel} text="Cancel" />
              <Button disabled={buttonIsDisabled} text="Submit" type="submit" />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

AddBuyerForm.defaultProps = {
  orgs: null,
};

AddBuyerForm.propTypes = {
  onCancel: func.isRequired,
  orgs: arrayOf(shape({})),
  refresh: func.isRequired,
};

export default AddBuyerForm;