// src/components/AgentCard.jsx
import React from "react";

/**
 * AgentCard
 * - Shows agent name, email, customer count badge
 * - Collapsible list of customers
 * - Shows upload metadata only when present (no placeholder dashes)
 */
export default function AgentCard({ agentName, agentEmail, customers = [], meta }) {
  // If there are no customers, parent should hide the card.
  if (!customers || customers.length === 0) return null;

  // Determine if metadata has any useful values
  const hasMeta =
    meta &&
    (
      (meta.originalFileName && meta.originalFileName.trim() !== "") ||
      (meta.uploadedAt) ||
      (meta.uploader && meta.uploader.email)
    );

  return (
    <div className="agent-card" role="region" aria-label={`Agent ${agentName}`}>
      <div className="agent-header">
        <div>
          <div className="agent-name">{agentName}</div>
          <div className="agent-email">{agentEmail}</div>
        </div>
        <div className="badge" title={`${customers.length} customers`}>{customers.length}</div>
      </div>

      <details>
        <summary>Show customers</summary>
        <ul className="cust-list">
          {customers.map((c, i) => (
            <li key={i}>
              <strong>{c.FirstName || "—"}</strong>
              {c.Phone ? ` — ${c.Phone}` : ""}
              {c.Notes ? ` • ${c.Notes}` : ""}
            </li>
          ))}
        </ul>
      </details>

      {hasMeta && (
        <div className="meta">
          {meta.originalFileName ? `File: ${meta.originalFileName}` : null}
          {meta.uploadedAt ? ` • Uploaded: ${new Date(meta.uploadedAt).toLocaleString()}` : null}
          {meta.uploader?.email ? ` • By: ${meta.uploader.email}` : null}
        </div>
      )}
    </div>
  );
}
