import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";

const router = Router();

// In-memory cache: normalized postcode -> { data, timestamp }
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Rate limit: 15 lookups per minute per IP
const lookupLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many lookups. Please try again later." },
});

// UK postcode regex (loose validation)
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

interface PostcodesIoResult {
  postcode: string;
  latitude: number;
  longitude: number;
  admin_district: string; // e.g. "Watford", "City of London"
  parish: string;
  admin_ward: string;
  region: string; // e.g. "East of England"
  country: string;
}

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
      console.log(`[AddressLookup] Cache hit for ${normalized}`);
      res.json({ success: true, data: cached.data });
      return;
    }

    // Step 1: Always use postcodes.io (free, no API key) for validation + geocoding
    console.log(`[AddressLookup] Looking up ${normalized} via postcodes.io`);
    const geoResponse = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`
    );

    if (geoResponse.status === 404) {
      res.status(404).json({ success: false, error: "Postcode not found. Please check and try again." });
      return;
    }

    if (!geoResponse.ok) {
      console.error(`[AddressLookup] postcodes.io returned ${geoResponse.status}`);
      res.status(502).json({ success: false, error: "Postcode lookup service is unavailable. Please enter your address manually." });
      return;
    }

    const geoData = await geoResponse.json() as {
      status: number;
      result: PostcodesIoResult | null;
    };

    if (!geoData.result) {
      res.status(404).json({ success: false, error: "Postcode not found. Please check and try again." });
      return;
    }

    const geo = geoData.result;
    const formattedPostcode = geo.postcode; // e.g. "WD17 4BU"
    const city = geo.admin_district || "";
    const latitude = geo.latitude;
    const longitude = geo.longitude;

    // Step 2: If IDEAL_POSTCODES_API_KEY is set, fetch individual addresses
    const idealKey = process.env.IDEAL_POSTCODES_API_KEY;
    let addresses: { line1: string; line2: string; locality: string; city: string; county: string }[] = [];

    if (idealKey) {
      try {
        console.log(`[AddressLookup] Fetching addresses from Ideal Postcodes for ${normalized}`);
        const idealResponse = await fetch(
          `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(normalized)}?api_key=${idealKey}`
        );

        if (idealResponse.ok) {
          const idealData = await idealResponse.json() as { code?: number; result?: IdealPostcodesAddress[] };
          if (idealData.result && idealData.result.length > 0) {
            addresses = idealData.result.map((addr) => ({
              line1: addr.line_1 || "",
              line2: addr.line_2 || "",
              locality: addr.dependant_locality || "",
              city: addr.post_town || "",
              county: addr.county || "",
            }));
          }
        } else {
          console.warn(`[AddressLookup] Ideal Postcodes returned ${idealResponse.status}, falling back to geocode-only`);
        }
      } catch (idealErr) {
        console.warn("[AddressLookup] Ideal Postcodes error, falling back:", idealErr);
      }
    }

    const result = {
      postcode: formattedPostcode,
      latitude,
      longitude,
      city,
      addresses,
    };

    // Cache the result
    cache.set(normalized, { data: result, timestamp: Date.now() });

    console.log(`[AddressLookup] Success for ${normalized}: ${addresses.length} addresses, city=${city}`);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[AddressLookup] Error:", err);
    res.status(500).json({ success: false, error: "Address lookup failed. Please enter your address manually." });
  }
});

export default router;
