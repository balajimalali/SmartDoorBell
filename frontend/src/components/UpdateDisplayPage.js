// UpdateDisplayPage.js
import React from 'react';
import {useState, useEffect} from 'react';

const UpdateDisplayPage = (props) => {
  const [message, setMessage] = useState("");
  const [latestMessage, setLatest] = useState(null);
  const [messages, setMessages] = useState(null);

  function textHandler(e){
    setMessage(e.target.value);
  }

  function submitHandler(){
    props.socket.emit("messageUpdate", message);
    setMessage("");
  }

  props.socket.on('updateStatus', (status)=>{
      fetchLatestMessage();
      fetchMessages();
  });

  const fetchLatestMessage = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_URL+'/latest-message');
      const data = await response.json();
      setLatest(data.message);
    } catch (error) {
      console.error('Error fetching visitor history:', error);
    }
  };
  // useEffect(() => {
  //     console.log(latestMessage); 
  //   }, [latestMessage]);

  function fetchMessages(){

    fetch(process.env.REACT_APP_URL+'/messages')
      .then(response => response.json())
      .then(data => {
        setMessages(data); 
        console.log(data);
      })
      .catch(error => console.error('Error fetching messages:', error));

  }

  useEffect(() => {
    fetchLatestMessage();
    fetchMessages();
  }, []);

  const handleSetMessage = (message) => {
    // Send request to set the message in the backend
    props.socket.emit("messageSet", message);
    fetchLatestMessage();
    // fetchMessages();
  };

  const handleDeleteMessage = async (messageId) => {
    // Send request to delete the message in the backend
    await fetch(process.env.REACT_APP_URL+`/messages/${messageId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        console.log('Message deleted successfully:', data);
    })
    .catch(error => console.error('Error deleting message:', error));

    fetchMessages();
  };

  return (
    <div className="container">
      <h1 className="display-6 my-3">Update Display</h1>
      <p className="fs-5"><b>Current Message:</b> {latestMessage && <>{latestMessage.message}</>}</p>
      <textarea className="form-control" name="message" value={message} onChange={textHandler} />
      <div className="w-100 text-end">
      <button className="btn btn-primary my-2 mx-5" onClick={submitHandler}>Update</button>
      </div>

      <hr />
      <div>
        <h2 className="fs-5 mt-4">Messages</h2>
        <ul className="list-group">
          {messages && messages.map(mes => (
            <li key={mes.id} className="list-group-item d-flex justify-content-between align-items-center">
              {mes.message}
              {mes.id === latestMessage?.id ? (
                <div>
                  <img className="mx-1" style={{color: "green"}} src='/check2-circle.svg' />
                  <button className="btn btn-secondary" disabled>Set</button>
                  <button className="btn btn-secondary mx-2" disabled>Delete</button>
                </div>
              ) : (
                <div>
                  <button className="btn btn-primary" onClick={() => handleSetMessage(mes.id)}>Set</button>
                  <button className="btn btn-danger mx-2" onClick={() => handleDeleteMessage(mes.id)}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UpdateDisplayPage;
