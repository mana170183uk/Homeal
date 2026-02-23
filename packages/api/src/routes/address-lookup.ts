import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";

const router = Router();

// In-memory cache: normalized postcode -> { data, timestamp }
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Rate limit: 10 lookups per minute per IP
const lookupLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many lookups. Please try again later." },
});

// UK postcode regex (loose validation)
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

interface IdealPostcodesAddress {
  line_1: string;
  line_2: string;
  line_3: string;
  post_town: string;
  county: string;
  postcode: string;
  building_name: string;
  sub_building_name: string;
  building_number: string;
  thoroughfare: string;
  dependant_locality: string;
  latitude: number;
  longitude: number;
}

// GET /api/v1/address-lookup/find/:postcode
router.get("/find/:postcode", lookupLimiter, async (req: Request, res: Response) => {
  try {
    const raw = (req.params.postcode as string || "").trim();
    if (!UK_POSTCODE_REGEX.test(raw)) {
      res.status(400).json({ success: false, error: "Invalid UK postcode format" });
      return;
    }

    const normalized = raw.replace(/\s+/g, "").toUpperCase();

    // Check cache
    const cached = cache.get(normalized);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.json({ success: true, data: cached.data });
      return;
    }

    const apiKey = process.env.IDEAL_POSTCODES_API_KEY;
    if (!apiKey) {
      res.status(503).json({ success: false, error: "Address lookup is temporarily unavailable" });
      return;
    }

    const response = await fetch(
      `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(normalized)}?api_key=${apiKey}`
    );

    if (response.status === 404) {
      res.status(404).json({ success: false, error: "No addresses found for this postcode" });
      return;
    }

    if (response.status === 429) {
      res.status(429).json({ success: false, error: "Address lookup limit reached. Please enter your address manually." });
      return;
    }

    const data = await response.json() as { code?: number; result?: IdealPostcodesAddress[] };

    if (data.code && data.code !== 2000) {
      // Ideal Postcodes error codes: 4010 = invalid key, 4040 = not found
      const msg = data.code === 4040
        ? "No addresses found for this postcode"
        : "Address lookup failed. Please enter your address manually.";
      res.status(data.code === 4040 ? 404 : 502).json({ success: false, error: msg });
      return;
    }

    const addresses: IdealPostcodesAddress[] = data.result || [];

    if (addresses.length === 0) {
      res.status(404).json({ success: false, error: "No addresses found for this postcode" });
      return;
    }

    // Use lat/lng from the first address
    const firstAddr = addresses[0];

    // Normalize addresses into a clean format
    const normalizedAddresses = addresses.map((addr) => ({
      line1: addr.line_1 || "",
      line2: addr.line_2 || "",
      locality: addr.dependant_locality || "",
      city: addr.post_town || "",
      county: addr.county || "",
    }));

    const result = {
      postcode: firstAddr.postcode || raw,
      latitude: firstAddr.latitude,
      longitude: firstAddr.longitude,
      addresses: normalizedAddresses,
    };

    // Cache the result
    cache.set(normalized, { data: result, timestamp: Date.now() });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[AddressLookup] Error:", err);
    res.status(500).json({ success: false, error: "Address lookup failed. Please enter your address manually." });
  }
});

export default router;
