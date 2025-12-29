// Locations.tsx (view-only, markers show villa name on hover with popup)
import React, { useState, useMemo, useRef, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import { PiMapPinBold } from "react-icons/pi";
import { MapPin } from "lucide-react";

const googleMapAPIKey = "AIzaSyCfNC5MDzTJ3HADdmPr-Q0ZGNOeuLKPKnw";

const LOCAL_THUMBNAIL = "/mnt/data/3c732c81-93ba-460a-bc0c-4418a9864cd0.png";

/* ================= TYPES ================= */
interface Coords {
  lat: number;
  lng: number;
}

interface SavedLocation extends Coords {
  key: string;
  text: string;
  details?: string;
  thumb?: string;
}

interface LocationsProps {
  lat?: number | null;
  lng?: number | null;
  text?: string;
  locationObj?: { lat?: number | null; lng?: number | null; address?: string } | null;
  villaName?: string;
  onSearchSelect?: (lat: number, lng: number, address?: string) => void;
  onMapReady?: (map: any, maps: any) => void;
}

/* ================= MARKER ================= */
const CustomMarker: React.FC<{
  lat: number;
  lng: number;
  color?: string;
  label?: string | null;
  details?: string | null;
}> = ({ color = "red", label, details }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        transform: "translate(-50%, -100%)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {hover && (
        <div className="mb-2 w-64 p-4 rounded-lg bg-white shadow-md border border-gray-200">
          <div className="flex gap-3">
            <MapPin className="text-gray-600" />
            <div>
              <p className="font-semibold text-sm text-gray-800">
                {label || "Location"}
              </p>
              {details && (
                <p className="text-xs text-gray-500 mt-1">{details}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <PiMapPinBold style={{ color, fontSize: "2rem" }} />
    </div>
  );
};

/* ================= MAIN ================= */
const Locations: React.FC<LocationsProps> = ({
  lat,
  lng,
  text,
  locationObj,
  villaName,
  onMapReady,
}) => {
  const initialLat = locationObj?.lat ?? lat ?? 0;
  const initialLng = locationObj?.lng ?? lng ?? 0;
  const initialText = locationObj?.address ?? text ?? villaName ?? "";

  const [savedVillas, setSavedVillas] = useState<SavedLocation[]>([
    {
      lat: initialLat,
      lng: initialLng,
      key: "default_villa",
      text: initialText,
      details: `Lat: ${initialLat.toFixed(6)}, Lng: ${initialLng.toFixed(6)}`,
      thumb: LOCAL_THUMBNAIL,
    },
  ]);

  /** 🔁 Map type toggle state */
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  const mapRef = useRef<any>(null);
  const mapsRef = useRef<any>(null);

  const defaultProps = useMemo(
    () => ({
      center: { lat: initialLat, lng: initialLng },
      zoom: 13,
    }),
    [initialLat, initialLng]
  );

  /* 🔁 Switch map type dynamically */
  useEffect(() => {
    if (mapRef.current && mapsRef.current) {
      mapRef.current.setMapTypeId(mapType);
    }
  }, [mapType]);

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <p className="lg:text-4xl md:text-5xl text-2xl font-semibold text-center text-[#111827] mb-2">Location</p>
        <p className="text-lg mt-4 text-gray-600">
          
          Click on the map to add a new villa location
        </p>
        {/* <p className="text-sm mt-4 text-gray-600">Switch between Normal & Satellite view anytime</p> */}
      </div>

      {/* Map Wrapper */}
      <div
        className="relative mx-auto overflow-hidden"
        style={{ height: "50vh", width: "100%", borderRadius: "12px" }}
      >
        {/* 🔘 Floating View Toggle */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white/90 backdrop-blur rounded-lg p-2 shadow-md border">
          <button
            onClick={() => setMapType("roadmap")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              mapType === "roadmap"
                ? "bg-teal-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            Normal
          </button>

          <button
            onClick={() => setMapType("satellite")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              mapType === "satellite"
                ? "bg-teal-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Map */}
        <GoogleMapReact
          bootstrapURLKeys={{ key: googleMapAPIKey }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => {
            mapRef.current = map;
            mapsRef.current = maps;
            map.setMapTypeId(mapType);
            if (onMapReady) onMapReady(map, maps);
          }}
        >
          {savedVillas.map((villa) => (
            <CustomMarker
              key={villa.key}
              lat={villa.lat}
              lng={villa.lng}
              label={villa.text}
              details={villa.details}
            />
          ))}
        </GoogleMapReact>
      </div>
    </div>
  );
};

export default Locations;
