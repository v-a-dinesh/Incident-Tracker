import { Routes, Route, Navigate } from "react-router-dom";
import IncidentList from "./pages/IncidentList";
import IncidentDetail from "./pages/IncidentDetail";
import CreateIncident from "./pages/CreateIncident";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<IncidentList />} />
        <Route path="/incidents/new" element={<CreateIncident />} />
        <Route path="/incidents/:id" element={<IncidentDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
