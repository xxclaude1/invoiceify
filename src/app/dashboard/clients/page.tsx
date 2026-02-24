"use client";

import { useState, useEffect, useCallback } from "react";

interface Address {
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: Address | null;
  taxId?: string | null;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  taxId: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    const res = await fetch("/api/clients");
    const data = await res.json();
    if (data.success) setClients(data.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (client: Client) => {
    const addr = client.address as Address | null;
    setForm({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      line1: addr?.line1 || "",
      city: addr?.city || "",
      state: addr?.state || "",
      postalCode: addr?.postalCode || "",
      country: addr?.country || "",
      taxId: client.taxId || "",
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: editingId || undefined,
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address:
        form.line1 || form.city
          ? {
              line1: form.line1,
              city: form.city,
              state: form.state,
              postalCode: form.postalCode,
              country: form.country,
            }
          : undefined,
      taxId: form.taxId || undefined,
    };

    await fetch("/api/clients", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    resetForm();
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client?")) return;
    await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
    fetchClients();
  };

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clients</h1>
          <p className="text-text-secondary mt-1">
            Manage your client address book
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-accent hover:bg-accent/90 text-white font-medium px-4 py-2.5 rounded-lg transition text-sm cursor-pointer"
        >
          + Add Client
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 className="font-semibold text-text-primary mb-4">
            {editingId ? "Edit Client" : "New Client"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Client or business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Tax ID
                </label>
                <input
                  value={form.taxId}
                  onChange={(e) => setField("taxId", e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Tax ID / VAT number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Address
                </label>
                <input
                  value={form.line1}
                  onChange={(e) => setField("line1", e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  City
                </label>
                <input
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  State / Postal
                </label>
                <div className="flex gap-2">
                  <input
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="State"
                  />
                  <input
                    value={form.postalCode}
                    onChange={(e) => setField("postalCode", e.target.value)}
                    className="w-24 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Zip"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2 rounded-lg transition text-sm disabled:opacity-50 cursor-pointer"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Client"
                    : "Add Client"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Client List */}
      {loading ? (
        <div className="text-center py-12 text-text-secondary">Loading...</div>
      ) : clients.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-border px-6 py-16 text-center">
          <svg
            className="w-12 h-12 mx-auto text-text-secondary/30 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
          <p className="text-text-secondary mb-4">
            No clients saved yet. Add your first client!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-block bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-lg transition text-sm cursor-pointer"
          >
            Add Client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {clients.map((client) => {
              const addr = client.address as Address | null;
              return (
                <div
                  key={client.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-surface/50 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {client.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {client.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {[client.email, client.phone, addr?.city]
                        .filter(Boolean)
                        .join(" · ") || "No details"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(client)}
                      className="text-xs text-accent hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
