# Sentinel-2 integration

## Plan and scope

Approved by the user: Copernicus STAC discovery, Sentinel Hub Process + Statistical APIs, storage, manual and daily sync. Changes exceed 30 lines because this adds an external integration, quality filtering, tenant access checks and UI states. No database migration is required: existing per-parcel/date/source uniqueness and metadata are reused. Deploy target: VULTR. Rollback: restore the previous application images; newly stored observations remain compatible.

## Configuration

Backend-only SENTINEL_CLIENT_ID and SENTINEL_CLIENT_SECRET are OAuth credentials for services.sentinel-hub.com (not CDSE OAuth credentials). S3 settings, including a public image URL, must be configured. SATELLITE_AUTO_SYNC=true enables daily sync at 04:00 Europe/Lisbon. `GET /api/v1/imagens-remotas/status` exposes only readiness booleans and missing variable names to authenticated users; missing configuration disables sync and surfaces a configuration state in the gallery. Never send credentials to the browser or commit them.

## Behaviour

The latest suitable acquisition in the previous 30 days is searched per parcel. Tile cloud cover <=30% is a catalogue prefilter, not parcel quality. Statistical masks exclude no-data, defective pixels, cloud shadows, medium/high probability clouds, cirrus and snow. Cloud percentage is measured over available pixels in the parcel; usable coverage is measured against geometryPixelCount. Reject observations with <70% usable coverage or no valid indices. Retry up to three distinct acquisition days, newest first. Store RGB preview, mean NDVI, NDRE (B08/B05), EVI, quality, catalogue candidate ID, acquisition window and attribution. No agronomic diagnosis is inferred solely from these indices.

The request grid approximates 10m pixels in WGS84 and is bounded to 1024 pixels per axis; parcels exceeding this extent are rejected rather than silently downsampled. B05 is natively 20m: NDRE is not a 10m independent measurement. The displayed PNG preserves grid aspect ratio and masks pixels outside the parcel. Processing uses the candidate day and may mosaic overlapping tiles; the catalogue candidate ID is not a claim that every pixel comes from that single product.

POST /api/v1/imagens-remotas/sync runs a synchronous organization-scoped sync for an authenticated user. The frontend exposes this as “Atualizar imagens”. The current backend is a single replica and processes parcels sequentially; a distributed queue/lock is required before scaling it. SATELLITE_AUTO_SYNC=true enables the daily 04:00 UTC job. Unique observation keys make repeated runs safe.

Existing Unsplash demonstration records are labelled DEMO by the development seed. This release does not delete stored records or convert them into real observations.

## Release verification

Require build, focused tests (geometry, cloud masks, formulae, provider errors, duplicates and tenant isolation), authenticated sync, real provider output and fetched stored PNG before declaring the integration operational. Empty credentials block real-provider acceptance even if application health is green.
