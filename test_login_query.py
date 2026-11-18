import os, requests

env_path = r'C:\Users\Qeea.Deeva\epr-dashboard\.env'
url, anon_key = '', ''
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line.startswith('VITE_SUPABASE_URL='): url = line.split('=', 1)[1].strip()
        if line.startswith('VITE_SUPABASE_ANON_KEY='): anon_key = line.split('=', 1)[1].strip()

# Login
login_url = f'{url}/auth/v1/token?grant_type=password'
headers = {'apikey': anon_key, 'Content-Type': 'application/json'}
payload = {'email': 'sinarjaya@epr26.id', 'password': 'Epr2026!SinarJaya'}
resp = requests.post(login_url, headers=headers, json=payload)

if resp.status_code == 200:
    token = resp.json()['access_token']
    auth_headers = {'apikey': anon_key, 'Authorization': f'Bearer {token}'}
    q = requests.get(f'{url}/rest/v1/epr_stores?select=*', headers=auth_headers)
    print('Status:', q.status_code)
    if q.status_code == 200:
        data = q.json()
        print('Total data ditemukan:', len(data))
        if data:
            print('Toko:', data[0]['epr_name'], '| Target:', data[0]['target_inc_tax'])
    else:
        print('Error:', q.text)
else:
    print('Login failed:', resp.text)
