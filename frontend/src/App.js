import Attendance from "./pages/Attendance";
import Home from "./pages/Home";
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/diemdanh" element={<Attendance />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
