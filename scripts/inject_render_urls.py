#!/usr/bin/env python3
"""
Inject real Render service URLs into render.yaml.

Usage:
  - Automatic (Render API): set env RENDER_API_KEY and run the script in a repo checkout.
    The script will call Render's /v1/services, match services by name, extract a domain
    (heuristic: first string containing '.onrender.com'), and replace placeholders in
    `render.yaml`.

  - Manual mapping: provide a JSON file mapping service name to URL with `--map map.json`.

The script updates `render.yaml` in-place. In CI, commit and push changes.
"""
import os
import sys
import argparse
import json
import re
from pathlib import Path

try:
    import yaml
except Exception:
    print("PyYAML is required. Install with: pip install pyyaml requests")
    sys.exit(1)

try:
    import requests
except Exception:
    print("requests is required. Install with: pip install pyyaml requests")
    sys.exit(1)


RENDER_API = "https://api.render.com/v1/services"
REPO_ROOT = Path(__file__).resolve().parents[1]
RENDER_YAML = REPO_ROOT / 'render.yaml'


def find_domain_in_obj(obj):
    """Recursively search for a string containing '.onrender.com' or other domain-like strings."""
    if isinstance(obj, str):
        if '.onrender.com' in obj or re.search(r'https?://', obj):
            return obj
        return None
    if isinstance(obj, dict):
        for v in obj.values():
            found = find_domain_in_obj(v)
            if found:
                return found
    if isinstance(obj, list):
        for item in obj:
            found = find_domain_in_obj(item)
            if found:
                return found
    return None


def fetch_render_services(api_key):
    headers = {'Authorization': f'Bearer {api_key}'}
    resp = requests.get(RENDER_API, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


def build_mapping_from_render(api_key, target_names):
    services = fetch_render_services(api_key)
    mapping = {}
    # Services can be nested objects; iterate and match by name
    for svc in services:
        name = svc.get('name') or (svc.get('service') or {}).get('name')
        if not name:
            continue
        if name in target_names:
            domain = find_domain_in_obj(svc)
            if domain:
                # If domain is not a URL, try to coerce
                if not domain.startswith('http'):
                    domain = 'https://' + domain.lstrip('/')
                mapping[name] = domain
    return mapping


def load_manual_map(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def update_render_yaml(mapping):
    if not RENDER_YAML.exists():
        print(f"render.yaml not found at {RENDER_YAML}")
        sys.exit(1)
    data = yaml.safe_load(RENDER_YAML.read_text())
    changed = False

    services = data.get('services', [])
    for svc in services:
        name = svc.get('name')
        if not name:
            continue
        # Update envVars entries that look like *_SERVICE_URL or APP_URL
        envs = svc.get('envVars') or {}
        updated = False
        for key, val in list(envs.items()):
            if key.endswith('_SERVICE_URL') or key == 'APP_URL':
                if name in mapping:
                    envs[key] = mapping[name]
                    updated = True
        if updated:
            svc['envVars'] = envs
            changed = True

    if changed:
        RENDER_YAML.write_text(yaml.safe_dump(data, sort_keys=False))
        print('render.yaml updated with mapping for:', ', '.join(mapping.keys()))
    else:
        print('No changes made to render.yaml (no matching placeholders found or mapping empty).')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--map', help='Path to JSON file with manual mapping {"auth-service":"https://..."}')
    args = p.parse_args()

    mapping = {}
    # Determine target service names from render.yaml
    if not RENDER_YAML.exists():
        print('render.yaml not found; aborting')
        sys.exit(1)
    data = yaml.safe_load(RENDER_YAML.read_text())
    target_names = [s.get('name') for s in data.get('services', []) if s.get('name')]

    if args.map:
        mapping = load_manual_map(args.map)
    else:
        api_key = os.environ.get('RENDER_API_KEY')
        if not api_key:
            print('No --map provided and RENDER_API_KEY not set; nothing to do.')
            sys.exit(1)
        mapping = build_mapping_from_render(api_key, set(target_names))

    if not mapping:
        print('Mapping is empty; aborting without changes.')
        sys.exit(0)

    update_render_yaml(mapping)


if __name__ == '__main__':
    main()
