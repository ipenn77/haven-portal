import { S3 } from 'aws-sdk';

import { s3bucketName } from '../constants';

export const getS3Service = (authData) => {
  const { awsConfig } = authData;
  awsConfig.credentials.clearCachedId();
  return new Promise((resolve, reject) => {
    awsConfig.credentials.get((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(
          new S3({
            apiVersion: '2006-03-01',
            params: { Bucket: s3bucketName },
          })
        );
      }
    });
  });
};

export const getImage = async ({ authData, key }) => {
  try {
    const s3Service = await getS3Service(authData);
    return new Promise((resolve) => {
      s3Service.getObject({ Key: key }, (err, data) => {
        if (err) {
          resolve(null);
        } else {
          resolve(data);
        }
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

export const uploadImage = async ({ authData, file }) => {
  try {
    const s3Service = await getS3Service(authData);
    const upload = s3Service.upload({
      Key: file.name,
      Body: file,
    });

    return new Promise((resolve, reject) => {
      upload.promise().then(
        (data) => {
          resolve(data);
        },
        (err) => {
          reject(err);
        }
      );
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteImage = async ({ authData, key }) => {
  try {
    const s3Service = await getS3Service(authData);
    return new Promise((resolve, reject) => {
      s3Service.deleteObject({ Key: key }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
