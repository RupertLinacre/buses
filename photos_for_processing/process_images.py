import json
import logging
import os
import re
import subprocess
from pathlib import Path

# --- Configuration ---
SOURCE_DIR = Path("photos_for_processing")
DEST_BASE_DIR = Path("public/images")
ROUTES_JSON_PATH = Path("src/assets/routes.json")
FFMPEG_SCALE_WIDTH = 1000
FFMPEG_QUALITY = 3  # q:v scale for JPG, lower is higher quality (2-5 is good)

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("image_processing.log"),
        logging.StreamHandler() # Also print to console
    ]
)

# --- Helper Functions ---

def load_routes_lookup(json_path: Path) -> dict | None:
    """Loads the routes.json and creates a lookup dict {service_code: dataset_id}."""
    if not json_path.is_file():
        logging.error(f"Lookup file not found: {json_path}")
        return None
    try:
        with open(json_path, 'r') as f:
            routes_data = json.load(f)

        lookup = {}
        for route in routes_data:
            if "service_code" in route and "dataset_id" in route:
                lookup[route["service_code"]] = route["dataset_id"]
            else:
                logging.warning(f"Skipping route entry missing 'service_code' or 'dataset_id': {route.get('filename', 'N/A')}")

        logging.info(f"Successfully loaded {len(lookup)} entries from {json_path}")
        return lookup
    except json.JSONDecodeError:
        logging.error(f"Error decoding JSON from {json_path}")
        return None
    except Exception as e:
        logging.error(f"An unexpected error occurred loading {json_path}: {e}")
        return None

def get_next_available_filename(dest_dir: Path, base_name: str) -> Path:
    """Finds the next available filename (e.g., base.jpg, base-alt1.jpg)."""
    dest_path = dest_dir / f"{base_name}.jpg"
    if not dest_path.exists():
        return dest_path

    alt_count = 1
    while True:
        alt_name = f"{base_name}-alt{alt_count}.jpg"
        dest_path = dest_dir / alt_name
        if not dest_path.exists():
            return dest_path
        alt_count += 1

def process_image(source_path: Path, routes_lookup: dict):
    """Processes a single image: lookup, compress, place."""
    try:
        filename_stem = source_path.stem # e.g., "PF0000508_586"

        # Convert filename part to service_code format for lookup
        # Assuming the relevant part is the entire stem for now
        # If only a *part* of the stem matches the service code structure, adjust this regex/logic
        service_code_lookup_key = filename_stem.replace("_", ":")

        # Perform lookup
        dataset_id = routes_lookup.get(service_code_lookup_key)

        if dataset_id is None:
            logging.warning(f"Could not find dataset_id for service code '{service_code_lookup_key}' derived from {source_path.name}. Skipping.")
            return

        # Determine destination directory and create if needed
        dest_dir = DEST_BASE_DIR / str(dataset_id)
        dest_dir.mkdir(parents=True, exist_ok=True) # Create parent dirs, ignore if exists

        # Determine final destination filename (handling -altN)
        dest_path = get_next_available_filename(dest_dir, filename_stem)

        # Construct and run ffmpeg command
        ffmpeg_cmd = [
            "ffmpeg",
            "-i", str(source_path),           # Input file
            "-vf", f"scale={FFMPEG_SCALE_WIDTH}:-1", # Scale filter
            "-q:v", str(FFMPEG_QUALITY),      # Quality setting for JPG
            str(dest_path)                    # Output file
        ]

        logging.info(f"Processing '{source_path.name}' -> '{dest_path}'")

        # Use subprocess.run for better control and error capture
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, check=False) # check=False to handle errors manually

        if result.returncode != 0:
            logging.error(f"ffmpeg failed for {source_path.name}. Return code: {result.returncode}")
            logging.error(f"ffmpeg stderr: {result.stderr.strip()}")
        else:
            logging.info(f"Successfully compressed and saved '{source_path.name}' to '{dest_path}'")
            # Optional: Move or delete the original file after successful processing
            # source_path.unlink() # Uncomment to delete original
            # source_path.rename(PROCESSED_DIR / source_path.name) # Uncomment to move original

    except Exception as e:
        logging.error(f"An unexpected error occurred processing {source_path.name}: {e}")


# --- Main Execution ---
if __name__ == "__main__":
    logging.info("--- Starting Image Processing Pipeline ---")

    if not SOURCE_DIR.is_dir():
        logging.error(f"Source directory not found: {SOURCE_DIR}")
        exit(1)

    if not DEST_BASE_DIR.is_dir():
        logging.warning(f"Base destination directory {DEST_BASE_DIR} does not exist. It will be created as needed.")
        # No need to exit, folders will be created per dataset_id

    routes_lookup = load_routes_lookup(ROUTES_JSON_PATH)
    if routes_lookup is None:
        logging.error("Failed to load routes lookup data. Exiting.")
        exit(1)

    processed_count = 0
    skipped_count = 0

    # Iterate through images in the source directory (case-insensitive)
    image_extensions = ["*.jpg", "*.jpeg", "*.png"]
    source_files = []
    for ext in image_extensions:
        source_files.extend(SOURCE_DIR.glob(ext))
        source_files.extend(SOURCE_DIR.glob(ext.upper())) # Add uppercase check explicitly if needed by OS/glob

    # Use a set to avoid processing duplicates if glob finds both lower/upper case of same file
    unique_source_files = set(source_files)

    if not unique_source_files:
        logging.info(f"No image files found in {SOURCE_DIR}")
    else:
        logging.info(f"Found {len(unique_source_files)} potential image files in {SOURCE_DIR}")

        for image_path in unique_source_files:
            if image_path.is_file(): # Ensure it's actually a file
                 # Check if lookup key exists before calling process_image to count skips accurately
                filename_stem = image_path.stem
                service_code_lookup_key = filename_stem.replace("_", ":")
                if service_code_lookup_key in routes_lookup:
                    process_image(image_path, routes_lookup)
                    processed_count += 1 # Increment only if processing is attempted
                else:
                    logging.warning(f"Skipping {image_path.name}: Could not find dataset_id for service code '{service_code_lookup_key}'.")
                    skipped_count += 1
            else:
                logging.warning(f"Skipping non-file item: {image_path}")


    logging.info("--- Image Processing Pipeline Finished ---")
    logging.info(f"Attempted processing for: {processed_count} images.")
    logging.info(f"Skipped due to lookup failure: {skipped_count} images.")