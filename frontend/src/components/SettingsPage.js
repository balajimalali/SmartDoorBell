// SettingsPage.js
import React from 'react';
import { useState, useEffect } from 'react';

const SettingsPage = (props) => {
  const [buzzerOn, setBuzzerOn] = useState(false);

  const handleToggleBuzzer = () => {
    props.socket.emit('toggleBuzzer', !buzzerOn);
    setBuzzerOn(!buzzerOn);
  };

  function fetchBuzzerStatus(){

    fetch(process.env.REACT_APP_URL+'/buzzer-status')
      .then(response => response.json())
      .then(data => {
        setBuzzerOn(data.status);
        console.log(data);
      })
      .catch(error => console.error('Error fetching messages:', error));

  }

  useEffect(() => {
    fetchBuzzerStatus();
  }, []);

  return (
    <div className="container">
      <h1 className="display-6 my-3">Settings</h1>
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="buzzerToggle"
          checked={buzzerOn}
          onChange={handleToggleBuzzer}
        />
        <label className="form-check-label" htmlFor="buzzerToggle">
          Buzzer
        </label>
      </div>
      <hr />
      <p>Status: {buzzerOn ? 'On' : 'Off'}</p>
    </div>
  );
}

export default SettingsPage;
