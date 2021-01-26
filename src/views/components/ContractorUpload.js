import { forEach, isArray, map, pick } from 'lodash';
import { func } from 'prop-types';
import React, { useState, useContext } from 'react';
import { v4 } from 'uuid';

import { styles } from '../../constants';
import { buttonContainer } from '../../constants/styles/manageOptions';

import AppContext from '../../helpers/context';
import { putItems } from '../../helpers/db';

import useInput from '../../hooks/useInput';

import { Button, TextArea } from '.';

const convertToNumber = (value) => Number(value || 0);
const convertToArray = (value) => {
  if (!value) return [];
  if (isArray(value)) return value;
  return [value];
};

const ContractorUpload = ({ refreshData }) => {
  const { authData } = useContext(AppContext);
  const { inputProps, reset, value } = useInput('');
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const buttonIsDisabled = !value || processing;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const rawJson = JSON.parse(value);
      if (!isArray(rawJson)) {
        throw new Error('Data must be an array.');
      }
      const transformedData = map(rawJson, (dataObject) => {
        const sanitizedData = pick(
          dataObject,
          'biddingList',
          'city',
          'companyName',
          'contractorCategory',
          'contractType',
          'email',
          'firstName',
          'insurance',
          'jobTitle',
          'lastName',
          'licenseNumber',
          'phone',
          'businessState',
          'streetAddress',
          'subtrade',
          'tradeCategory',
          'zip'
        );
        return {
          ...sanitizedData,
          id: v4(),
          contractorPrice: convertToNumber(sanitizedData.contractorPrice),
          features: convertToArray(sanitizedData.features),
          materials: convertToArray(sanitizedData.materials),
          productLocation: convertToArray(sanitizedData.productLocation),
          sellPrice: convertToNumber(sanitizedData.sellPrice),
        };
      });

      forEach(transformedData, (dataObject) => {
        if (!dataObject.id) {
          throw new Error('"id" is required for all items.');
        }
        if (!dataObject.optionType || !/^(id|contractors)$/i.test(dataObject.optionType)) {
          throw new Error(
            'A value of "id" or "contractors" is required for the value of "optionType" for all items.'
          );
        }
      });

      await putItems({ authData, items: transformedData, tableName: 'contractors' });
      reset();
      refreshData();
      setSubmitSuccess('Your data has been uploaded!');
    } catch (err) {
      setSubmitError(`An error occured while uploading: ${err.message}`);
    }
    setProcessing(false);
  };

  return (
    <div className="form-container">
      <h3>Upload JSON Data to Options DB</h3>
      <form onSubmit={handleSubmit}>
        <TextArea labelText="Paste JSON Data Here" {...inputProps} />

        <div className={buttonContainer}>
          <Button disabled={buttonIsDisabled} text="Submit" type="submit" />
        </div>
        <div>
          {submitError && <div className={styles.errorText}>{submitError}</div>}
          {submitSuccess && <div className={styles.successText}>{submitSuccess}</div>}
        </div>
      </form>
    </div>
  );
};

ContractorUpload.propTypes = {
  refreshData: func.isRequired,
};

export default ContractorUpload;
