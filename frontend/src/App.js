import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import UpdateDisplayPage from './components/UpdateDisplayPage';
import VisitorsHistoryPage from './components/VisitorsHistoryPage';
import SettingsPage from './components/SettingsPage';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  const socket = io(process.env.REACT_APP_URL+'/frontend');

  socket.on('visitor', (data)=>{
    console.log(data);
    toast("visitor detected");
  })
  
  return (
    <BrowserRouter>
      <Navbar/>
      <ToastContainer />
      <Routes>
        <Route path="/">
          <Route index element={<UpdateDisplayPage socket={socket} />} />
          <Route path="/history" element={<VisitorsHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
