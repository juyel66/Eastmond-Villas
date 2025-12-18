// LocationCreateProperty.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import { PiMapPinBold } from "react-icons/pi";
import { IoClose } from "react-icons/io5";

/* ================= TYPES ================= */
interface Coords {
  lat: number;
  lng: number;
}

interface MapClickEvent {
  lat: number;
  lng: number;
}

interface SavedLocation extends Coords {
  key: string;
  text: string;
}

interface LocationsProps {
  lat: number;
  lng: number;
  text: string;
  onLocationAdd?: (villaData: {
    lat: number;
    lng: number;
    name: string;
    description: string;
  }) => void;
  coordDecimals?: number;
}

const googleMapAPIKey = "AIzaSyCfNC5MDzTJ3HADdmPr-Q0ZGNOeuLKPKnw";

/* ================= MARKER ================= */
const CustomMarker = ({
  lat,
  lng,
  color,
  onClick,
}: {
  lat: number;
  lng: number;
  color: string;
  onClick?: () => void;
}) => (
  <div
    style={{
      position: "absolute",
      transform: "translate(-50%, -100%)",
      cursor: "pointer",
      zIndex: 10,
    }}
    onClick={onClick}
  >
    <PiMapPinBold style={{ color, fontSize: "2rem" }} />
  </div>
);

/* ================= MODAL ================= */
interface AddVillaModalProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onAddVilla: (data: {
    lat: number;
    lng: number;
    name: string;
    description: string;
  }) => void;
  coordDecimals: number;
}

const AddVillaModal: React.FC<AddVillaModalProps> = ({
  lat,
  lng,
  onClose,
  onAddVilla,
  coordDecimals,
}) => {
  const [villaName, setVillaName] = useState("");
  const [description, setDescription] = useState("");

  const round = (v: number) => Number(v.toFixed(coordDecimals));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!villaName.trim()) return;

    onAddVilla({
      lat: round(lat),
      lng: round(lng),
      name: villaName,
      description,
    });
  };

  return (
    /* 🔥 FIXED FULLSCREEN OVERLAY */
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h2 className="text-lg font-bold text-gray-800">Add New Villa</h2>
          <button onClick={onClose}>
            <IoClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <p className="text-sm text-gray-600">
            <strong>Lat:</strong> {round(lat)} <br />
            <strong>Lng:</strong> {round(lng)}
          </p>

          <input
            placeholder="Villa Name"
            value={villaName}
            onChange={(e) => setVillaName(e.target.value)}
            className="border rounded w-full py-2 px-3"
            required
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="border rounded w-full py-2 px-3 resize-none"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-1.5 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-500 text-white px-4 py-1.5 rounded"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= MAIN ================= */
const LocationCreateProperty: React.FC<LocationsProps> = ({
  lat,
  lng,
  text,
  onLocationAdd,
  coordDecimals = 6,
}) => {
  const [savedVillas, setSavedVillas] = useState<SavedLocation[]>([
    { lat, lng, key: "default_villa", text },
  ]);

  const [newLocation, setNewLocation] = useState<Coords | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMarker, setSearchMarker] = useState<Coords | null>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  const mapRef = useRef<any>(null);
  const mapsRef = useRef<any>(null);

  const defaultProps = useMemo(
    () => ({
      center: { lat, lng },
      zoom: 13,
    }),
    [lat, lng]
  );

  useEffect(() => {
    mapRef.current?.setMapTypeId(mapType);
  }, [mapType]);

  const handleMapClick = (e: MapClickEvent) => {
    setNewLocation({ lat: e.lat, lng: e.lng });
    setIsModalOpen(true);
  };

  const handleAddVilla = (data: any) => {
    setSavedVillas((prev) => [
      ...prev,
      {
        lat: data.lat,
        lng: data.lng,
        key: Date.now().toString(),
        text: data.name,
      },
    ]);

    setIsModalOpen(false);
    setNewLocation(null);
    setSearchMarker(null);
    onLocationAdd?.(data);
  };

  const handleSearch = () => {
    if (!searchQuery || !mapsRef.current) return;
    const geocoder = new mapsRef.current.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        setSearchMarker({ lat: loc.lat(), lng: loc.lng() });
        mapRef.current?.panTo({ lat: loc.lat(), lng: loc.lng() });
      }
    });
  };

  return (
    <div>
      {/* Search */}
      <div className="flex mb-4">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search location..."
          className="border px-4 py-2 rounded-l w-72"
        />
        <button
          onClick={handleSearch}
          className="bg-teal-500 text-white px-4 rounded-r"
        >
          Search
        </button>
      </div>

      {/* Map */}
      <div
        className="relative overflow-hidden"
        style={{ height: "35vh", width: "100%", borderRadius: "12px" }}
      >
        {/* Toggle */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white/90 p-2 rounded-lg shadow">
          <button
            onClick={() => setMapType("roadmap")}
            className={`px-3 py-1.5 text-xs rounded ${
              mapType === "roadmap" ? "bg-teal-600 text-white" : "border"
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setMapType("satellite")}
            className={`px-3 py-1.5 text-xs rounded ${
              mapType === "satellite" ? "bg-teal-600 text-white" : "border"
            }`}
          >
            Satellite
          </button>
        </div>

        <GoogleMapReact
          bootstrapURLKeys={{ key: googleMapAPIKey }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => {
            mapRef.current = map;
            mapsRef.current = maps;
            map.setMapTypeId(mapType);
          }}
          onClick={handleMapClick}
        >
          {savedVillas.map((v) => (
            <CustomMarker key={v.key} lat={v.lat} lng={v.lng} color="red" />
          ))}

          {searchMarker && (
            <CustomMarker
              lat={searchMarker.lat}
              lng={searchMarker.lng}
              color="green"
              onClick={() => {
                setNewLocation(searchMarker);
                setIsModalOpen(true);
              }}
            />
          )}

          {newLocation && (
            <CustomMarker lat={newLocation.lat} lng={newLocation.lng} color="blue" />
          )}
        </GoogleMapReact>
      </div>

      {/* 🔥 Modal OUTSIDE map */}
      {isModalOpen && newLocation && (
        <AddVillaModal
          lat={newLocation.lat}
          lng={newLocation.lng}
          coordDecimals={coordDecimals}
          onClose={() => {
            setIsModalOpen(false);
            setNewLocation(null);
          }}
          onAddVilla={handleAddVilla}
        />
      )}
    </div>
  );
};

export default LocationCreateProperty;
