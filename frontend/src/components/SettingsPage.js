// SettingsPage.js
import React from 'react';
import { useState, useEffect } from 'react';

const SettingsPage = (props) => {
  const [buzzerOn, setBuzzerOn] = useState(false);

  const [email, setEmail] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_URL+'/subscriptions');
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_URL+'/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setSubscriptions(data);
      console.log(data);

      setEmail('');
      // fetchSubscriptions();
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleUnsubscribe = async (id) => {
    try {
      await fetch(process.env.REACT_APP_URL+`/unsubscribe/${id}`, {
        method: 'DELETE',
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

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
    fetchSubscriptions();
  }, []);

  return (
    <>
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
      <p>Status: {buzzerOn ? 'On' : 'Off'}</p>
      <hr />
    </div>

    <div className="container mt-4">
        <h1 className="display-6 my-3">Email Subscriptions</h1>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
      <div className="w-100 text-end">
          <button className="btn btn-primary mt-2 mx-4" onClick={handleSubscribe}>
            Subscribe
          </button>
          </div>
        </div>
        <ul className="list-group">
          {subscriptions && subscriptions.map((subscription) => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={subscription.id}>
              {subscription.email}
              <button
                className={`btn ${subscription.status ? 'btn-danger' : 'btn-success'}`}
                onClick={() => handleUnsubscribe(subscription.id)}
              >
                {subscription.status ? 'Unsubscribe' : 'Subscribe'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default SettingsPage;
