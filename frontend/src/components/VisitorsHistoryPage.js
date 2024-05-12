// VisitorsHistoryPage.js
import React, { useState, useEffect } from 'react';

function VisitorHistoryPage() {
  const [visitorHistory, setVisitorHistory] = useState([]);

  useEffect(() => {
    fetchVisitorHistory();
  }, []);

  const fetchVisitorHistory = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_URL+'/visitor-history');
      const data = await response.json();
      console.log(data);
      setVisitorHistory(data);
    } catch (error) {
      console.error('Error fetching visitor history:', error);
    }
  };

  function formatVisitorTime(timeString) {
    const visitTime = new Date(timeString);
    return visitTime.toLocaleString(); // Format the date to the user's local time zone
  }

  return (
    <div className="container">
      <h1 className="display-6 my-3">Visitors History</h1>
      <ul className="list-group">
        {visitorHistory.map((visitor) => (
          <li key={visitor.id} className="list-group-item">
            <p className="mb-1">Visit Time: {formatVisitorTime(visitor.visitTime)}</p>
            {/* <p className="mb-0">Message: {visitor.message}</p> */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VisitorHistoryPage;
