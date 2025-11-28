// src/pages/Dashboard.jsx
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import AddAgentForm from "../components/AddAgentForm";
import UploadForm from "../components/UploadForm";
import AgentCard from "../components/AgentCard";
import "../App.css";

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grouped, setGrouped] = useState([]); // aggregated per agent
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 1000; // fetch many so we can aggregate client-side for this app

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  const loadData = async (p = 1) => {
    try {
      const [agentsRes, asgRes] = await Promise.all([
        api.get("/agents"),
        api.get(`/upload/assignments?page=${p}&limit=${limit}`)
      ]);

      const agentsList = agentsRes.data;
      const assignData = asgRes.data.data || asgRes.data; // support old/new shape

      setAgents(agentsList);
      setAssignments(assignData);
      setPages(asgRes.data.pages || 1);
      setPage(asgRes.data.page || p);

      // Group assignments by agent id and combine customers
      const map = {};
      for (const a of agentsList) {
        map[a._id] = {
          agent: a,
          customers: [],
          metas: [] // keep metadata if multiple uploads
        };
      }

      for (const asg of assignData) {
        const aid = asg.agent?._id || asg.agent;
        if (!map[aid]) {
          // agent might have been deleted or not in the first list — create placeholder
          map[aid] = { agent: asg.agent || { name: "Unknown", email: "" }, customers: [], metas: [] };
        }
        // append customers
        if (Array.isArray(asg.customers) && asg.customers.length) {
          map[aid].customers = map[aid].customers.concat(asg.customers);
          map[aid].metas.push({
            originalFileName: asg.originalFileName,
            uploadedAt: asg.uploadedAt,
            uploader: asg.uploader
          });
        }
      }

      // Create array and filter out agents with zero customers
      const groupedArray = Object.values(map)
        .map((entry) => ({
          agent: entry.agent,
          customers: entry.customers,
          // pick the latest meta if multiple
          meta: entry.metas.length ? entry.metas[entry.metas.length - 1] : null
        }))
        .filter((x) => x.customers && x.customers.length > 0); // hide zero-customer agents

      // Sort by agent name for predictable order
      groupedArray.sort((a,b) => (a.agent.name || "").localeCompare(b.agent.name || ""));

      setGrouped(groupedArray);

    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  useEffect(() => { loadData(page); }, [page]);

  return (
    <div className="app-container">
      <div className="header">
        <h2>Admin Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="layout">
        <div className="control-card">
          <AddAgentForm onAdded={() => loadData(1)} />
          <UploadForm onUploaded={() => loadData(1)} />
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>Assignments</h3>

          <div className="agents-grid">
            {grouped.length === 0 && <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>No assignments yet.</div>}
            {grouped.map((g) => (
              <AgentCard
                key={g.agent._id}
                agentName={g.agent.name}
                agentEmail={g.agent.email}
                customers={g.customers}
                meta={g.meta}
              />
            ))}
          </div>

          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
            <span>Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
