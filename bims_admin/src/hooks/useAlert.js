import React, { useState } from 'react';
import Alert from './Alert';

export const useAlert = () => {
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const hideAlert = () => {
    setAlert({ show: false, type: '', message: '' });
  };

  const AlertComponent = () => (
    <Alert
      show={alert.show}
      type={alert.type}
      message={alert.message}
      onClose={hideAlert}
    />
  );

  return { showAlert, AlertComponent };
};

export const validateRequiredFields = (fields, showAlert) => {
  for (const [fieldName, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      const fieldLabel = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      showAlert('error', `${fieldLabel} is required`);
      return false;
    }
  }
  return true;
};
