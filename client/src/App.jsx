import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddApplication from './pages/AddApplication';
import AddSkill from './pages/AddSkill';
import AddProject from './pages/AddProject';

function App() {
  return (
    <>
      <Navbar />
      <main className="container main-content animate-in">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddApplication />} />
          <Route path="/add-skill" element={<AddSkill />} />
          <Route path="/add-project" element={<AddProject />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
