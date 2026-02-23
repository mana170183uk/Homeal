"use client";

import { useState, useCallback, useRef } from "react";
import { Search, Loader2, AlertCircle, MapPin, ChevronDown } from "lucide-react";
import { api } from "../lib/api";

// UK postcode regex (loose validation — checks format, not existence)
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

interface AddressResult {
  line1: string;
  line2: string;
  locality: string;
  city: string;
  county: string;
}

interface LookupData {
  postcode: string;
  latitude: number;
  longitude: number;
  addresses: AddressResult[];
}

interface SelectedAddress extends AddressResult {
  postcode: string;
  latitude: number;
  longitude: number;
}

interface PostcodeLookupProps {
  /** Called when user selects an address from the dropdown */
  onAddressSelected: (address: SelectedAddress) => void;
  /** Called when postcode is resolved (provides lat/lng even before address selection) */
  onPostcodeResolved?: (data: { postcode: string; latitude: number; longitude: number }) => void;
  /** Called when user clicks "Enter manually" */
  onManualEntry?: () => void;
  /** Initial postcode value (for edit mode) */
  initialPostcode?: string;
  /** Placeholder text */
  placeholder?: string;
  /** CSS class for the outer wrapper */
  className?: string;
}

export default function PostcodeLookup({
  onAddressSelected,
  onPostcodeResolved,
  onManualEntry,
  initialPostcode = "",
  placeholder = "Enter your postcode",
  className = "",
}: PostcodeLookupProps) {
  const [postcode, setPostcode] = useState(initialPostcode);
  const [addresses, setAddresses] = useState<AddressResult[]>([]);
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLookup = useCallback(async () => {
    const trimmed = postcode.trim();
    if (!trimmed) {
      setError("Please enter a postcode");
      return;
    }
    if (!UK_POSTCODE_REGEX.test(trimmed)) {
      setError("Please enter a valid UK postcode (e.g. SW1A 1AA)");
      return;
    }

    setLoading(true);
    setError("");
    setAddresses([]);
    setHasSearched(true);

    try {
      const res = await api<LookupData>(
        `/address-lookup/find/${encodeURIComponent(trimmed)}`
      );
      if (res.success && res.data) {
        setAddresses(res.data.addresses);
        setLookupData(res.data);
        onPostcodeResolved?.({
          postcode: res.data.postcode,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
        });
      } else {
        setError((res as any).error || "Postcode not found");
      }
    } catch {
      setError("Failed to look up postcode. You can enter your address manually.");
    } finally {
      setLoading(false);
    }
  }, [postcode, onPostcodeResolved]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLookup();
    }
  };

  const handleSelectAddress = (index: number) => {
    if (!lookupData || index < 0 || index >= addresses.length) return;
    const addr = addresses[index];
    onAddressSelected({
      ...addr,
      postcode: lookupData.postcode,
      latitude: lookupData.latitude,
      longitude: lookupData.longitude,
    });
  };

  // Build display label for each address
  const getAddressLabel = (addr: AddressResult): string => {
    const parts = [addr.line1, addr.line2, addr.locality, addr.city].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Postcode input + Find Address button */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-soft)] mb-1">
          <MapPin className="w-3.5 h-3.5 inline mr-1" />
          Postcode Lookup
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value.toUpperCase());
              if (hasSearched) {
                setHasSearched(false);
                setAddresses([]);
                setError("");
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2.5 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 uppercase tracking-wide"
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={loading}
            className="px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Searching..." : "Find Address"}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-alert text-sm bg-alert/5 border border-alert/20 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Address dropdown */}
      {addresses.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--text-soft)] mb-1">
            Select your address ({addresses.length} found)
          </label>
          <div className="relative">
            <select
              defaultValue=""
              onChange={(e) => handleSelectAddress(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 appearance-none cursor-pointer"
            >
              <option value="" disabled>
                -- Select your address --
              </option>
              {addresses.map((addr, idx) => (
                <option key={idx} value={idx}>
                  {getAddressLabel(addr)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
      )}

      {/* Manual entry fallback */}
      {hasSearched && (
        <button
          type="button"
          onClick={onManualEntry}
          className="text-xs text-accent hover:underline"
        >
          Can&apos;t find your address? Enter manually
        </button>
      )}
    </div>
  );
}
