"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Check,
  X,
  Loader2,
  Home,
  Briefcase,
  Building2,
} from "lucide-react";
import Header from "../components/Header";
import { api } from "../lib/api";
import type { Address } from "../lib/types";

const LABEL_ICONS: Record<string, React.ReactNode> = {
  Home: <Home className="w-4 h-4" />,
  Work: <Briefcase className="w-4 h-4" />,
  Office: <Building2 className="w-4 h-4" />,
};

function getLabelIcon(label: string) {
  return LABEL_ICONS[label] || <MapPin className="w-4 h-4" />;
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add/Edit form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLabel, setFormLabel] = useState("Home");
  const [formLine1, setFormLine1] = useState("");
  const [formLine2, setFormLine2] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formPostcode, setFormPostcode] = useState("");
  const [formDefault, setFormDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("homeal_token");
    if (!token) {
      router.push("/login?redirect=/addresses");
      return;
    }
    fetchAddresses(token);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchAddresses(token: string) {
    setLoading(true);
    try {
      const res = await api<Address[]>("/users/addresses", { token });
      if (res.success && res.data) {
        setAddresses(res.data);
      } else {
        setError(res.error || "Failed to load addresses.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormLabel("Home");
    setFormLine1("");
    setFormLine2("");
    setFormCity("");
    setFormPostcode("");
    setFormDefault(false);
    setFormError("");
  }

  function startEdit(addr: Address) {
    setEditingId(addr.id);
    setFormLabel(addr.label);
    setFormLine1(addr.line1);
    setFormLine2(addr.line2 || "");
    setFormCity(addr.city);
    setFormPostcode(addr.zipCode);
    setFormDefault(addr.isDefault);
    setFormError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!formLine1.trim() || !formCity.trim() || !formPostcode.trim()) {
      setFormError("Address line 1, city, and postcode are required.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const token = localStorage.getItem("homeal_token")!;

      // Geocode postcode
      let latitude: number | undefined;
      let longitude: number | undefined;
      try {
        const geoRes = await api<{ lat: number; lng: number; area: string }>(
          `/chefs/geocode?postcode=${encodeURIComponent(formPostcode.trim())}`
        );
        if (geoRes.success && geoRes.data) {
          latitude = geoRes.data.lat;
          longitude = geoRes.data.lng;
        }
      } catch {
        // proceed without geocode
      }

      const body = {
        label: formLabel.trim() || "Home",
        line1: formLine1.trim(),
        line2: formLine2.trim() || undefined,
        city: formCity.trim(),
        state: undefined,
        zipCode: formPostcode.trim(),
        latitude,
        longitude,
        isDefault: formDefault || addresses.length === 0,
      };

      if (editingId) {
        // Update
        const res = await api<Address>(`/users/addresses/${editingId}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(body),
        });
        if (res.success && res.data) {
          setAddresses((prev) => {
            let updated = prev.map((a) => (a.id === editingId ? res.data! : a));
            // If set as default, unset others
            if (res.data!.isDefault) {
              updated = updated.map((a) =>
                a.id !== editingId ? { ...a, isDefault: false } : a
              );
            }
            return updated;
          });
          resetForm();
        } else {
          setFormError(res.error || "Failed to update address.");
        }
      } else {
        // Create
        const res = await api<Address>("/users/addresses", {
          method: "POST",
          token,
          body: JSON.stringify(body),
        });
        if (res.success && res.data) {
          setAddresses((prev) => {
            let updated = [...prev, res.data!];
            if (res.data!.isDefault) {
              updated = updated.map((a) =>
                a.id !== res.data!.id ? { ...a, isDefault: false } : a
              );
            }
            return updated;
          });
          resetForm();
        } else {
          setFormError(res.error || "Failed to save address.");
        }
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("homeal_token")!;
      const res = await api<{ id: string }>(`/users/addresses/${id}`, {
        method: "DELETE",
        token,
      });
      if (res.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const token = localStorage.getItem("homeal_token")!;
      const res = await api<Address>(`/users/addresses/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.success) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id }))
        );
      }
    } catch {
      // silently fail
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg)] pt-20 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">
                My Addresses
              </h1>
              <p className="text-sm text-[var(--text-soft)] mt-1">
                Manage your delivery addresses
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 transition"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="glass-card p-5 mb-6 border-2 border-accent/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text)]">
                  {editingId ? "Edit Address" : "New Address"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-1.5 rounded-lg hover:bg-[var(--input)] transition"
                >
                  <X className="w-5 h-5 text-[var(--text-soft)]" />
                </button>
              </div>

              {/* Label picker */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-soft)] mb-2">
                  Label
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["Home", "Work", "Office", "Other"].map((label) => (
                    <button
                      key={label}
                      onClick={() => setFormLabel(label)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        formLabel === label
                          ? "bg-accent text-white"
                          : "bg-[var(--input)] text-[var(--text)] hover:bg-[var(--input)]/80"
                      }`}
                    >
                      {getLabelIcon(label)}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-soft)] mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={formLine1}
                    onChange={(e) => setFormLine1(e.target.value)}
                    placeholder="House number, street name"
                    className="w-full px-3 py-2.5 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-soft)] mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formLine2}
                    onChange={(e) => setFormLine2(e.target.value)}
                    placeholder="Flat, floor, building (optional)"
                    className="w-full px-3 py-2.5 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-soft)] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2.5 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-soft)] mb-1">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      value={formPostcode}
                      onChange={(e) => setFormPostcode(e.target.value)}
                      placeholder="SW1A 1AA"
                      className="w-full px-3 py-2.5 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                </div>

                {/* Default toggle */}
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={formDefault}
                    onChange={(e) => setFormDefault(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border)] text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-[var(--text)]">
                    Set as default address
                  </span>
                </label>
              </div>

              {formError && (
                <p className="text-red-500 text-sm mt-3">{formError}</p>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingId ? "Update" : "Save"} Address
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-[var(--input)] text-[var(--text)] text-sm font-medium rounded-xl hover:bg-[var(--input)]/80 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
              <p className="text-[var(--text-soft)] text-sm">
                Loading addresses...
              </p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="glass-card p-6 text-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && addresses.length === 0 && !showForm && (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                No addresses yet
              </h3>
              <p className="text-[var(--text-soft)] text-sm mb-4">
                Add your first delivery address to get started
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>
          )}

          {/* Address list */}
          {!loading && addresses.length > 0 && (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`glass-card p-4 relative transition ${
                    addr.isDefault
                      ? "border-2 border-accent/30"
                      : "border border-transparent"
                  }`}
                >
                  {/* Default badge */}
                  {addr.isDefault && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      Default
                    </span>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Label icon */}
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 text-accent">
                      {getLabelIcon(addr.label)}
                    </div>

                    {/* Address details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text)] text-sm">
                        {addr.label}
                      </h3>
                      <p className="text-[var(--text-soft)] text-sm mt-0.5 leading-relaxed">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}
                        <br />
                        {addr.city}
                        {addr.state ? `, ${addr.state}` : ""} — {addr.zipCode}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-3">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition"
                          >
                            <Star className="w-3 h-3" />
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(addr)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[var(--text-soft)] bg-[var(--input)] rounded-lg hover:bg-[var(--input)]/80 transition"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(addr.id)}
                          disabled={deletingId === addr.id}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition disabled:opacity-50"
                        >
                          {deletingId === addr.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
