// frontend/src/components/AddAgentForm.jsx
import { useState } from 'react';
import api from '../api/client';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default function AddAgentForm({ onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [msg, setMsg] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');

    // basic required fields check (frontend)
    if (!form.name || !form.email || !form.mobile || !form.password) {
      setMsg('Please fill all fields.');
      return;
    }

    // client-side phone validation + normalization
    let phoneObj;
    try {
      phoneObj = parsePhoneNumberFromString(form.mobile || '');
    } catch (err) {
      phoneObj = null;
    }
    if (!phoneObj || !phoneObj.isValid()) {
      setMsg('Invalid mobile number. Use full international format, e.g. +919876543210');
      return;
    }
    const normalized = phoneObj.number; // E.164 format

    try {
      // send normalized mobile to backend
      const { data } = await api.post('/agents', { ...form, mobile: normalized });
      setMsg('Agent added: ' + data.name);
      setForm({ name: '', email: '', mobile: '', password: '' });
      if (onAdded) onAdded();
    } catch (err) {
      // prefer backend error message if present
      const errorText = err?.response?.data?.error || err?.message || 'Error adding agent';
      setMsg(errorText);
    }
  };

  return (
    <form onSubmit={submit} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <h3>Add Agent</h3>
      <input
        name="name"
        value={form.name}
        onChange={change}
        placeholder="Name"
        style={{ display: 'block', margin: '6px 0', padding: 6, width: '100%' }}
      />
      <input
        name="email"
        value={form.email}
        onChange={change}
        placeholder="Email"
        style={{ display: 'block', margin: '6px 0', padding: 6, width: '100%' }}
      />
      <input
        name="mobile"
        value={form.mobile}
        onChange={change}
        placeholder="Mobile (e.g. +91XXXXXXXXXX)"
        style={{ display: 'block', margin: '6px 0', padding: 6, width: '100%' }}
      />
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={change}
        placeholder="Password"
        style={{ display: 'block', margin: '6px 0', padding: 6, width: '100%' }}
      />
      <button type="submit" style={{ padding: 8 }}>Add</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
