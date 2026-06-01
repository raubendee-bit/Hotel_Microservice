#!/usr/bin/env python3
import os

services = ['auth-service', 'booking-service', 'finance-service', 'housekeeping-service']
for service in services:
    entrypoint_path = f'services/{service}/docker/entrypoint.sh'
    with open(entrypoint_path, 'rb') as f:
        content = f.read()
    # Convert CRLF to LF
    content = content.replace(b'\r\n', b'\n')
    with open(entrypoint_path, 'wb') as f:
        f.write(content)
    print(f'Fixed {entrypoint_path}')
