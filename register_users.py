"""
Script Pendaftaran 24 Akun Toko EPR Menggunakan Supabase Admin API
(Bypass / Bebas dari 'email rate limit exceeded')

Cara pakai:
1. Buka Supabase Dashboard -> Project Settings -> API.
2. Salin 'service_role' key (secret).
3. Masukkan ke file .env:
   SUPABASE_SERVICE_ROLE_KEY=eyJh...
4. Jalankan: python register_users.py
"""

import os, time, requests, json

env_path = os.path.join(os.path.dirname(__file__), '.env')
supabase_url = None
service_key = None
anon_key = None

if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('VITE_SUPABASE_URL='):
                supabase_url = line.split('=', 1)[1].strip()
            elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                service_key = line.split('=', 1)[1].strip()
            elif line.startswith('VITE_SUPABASE_ANON_KEY='):
                anon_key = line.split('=', 1)[1].strip()

# Jika belum ada di .env, tanyakan interaktif atau gunakan yang ada
if not supabase_url:
    supabase_url = input("Masukkan Supabase URL (contoh: https://xyz.supabase.co): ").strip()

active_key = service_key or anon_key
use_admin = bool(service_key)

if not service_key:
    print("\n[INFO] 'SUPABASE_SERVICE_ROLE_KEY' belum ditemukan di .env.")
    print("Untuk menghindari batasan 'email rate limit exceeded', disarankan menggunakan Service Role Key.")
    user_input_key = input("Masukkan Service Role Key Anda (atau tekan Enter untuk mencoba dengan Anon Key): ").strip()
    if user_input_key:
        active_key = user_input_key
        use_admin = True

if not active_key:
    print("❌ ERROR: Tidak ada API key yang ditemukan!")
    exit(1)

stores_accounts = [
    ('EPR-0038', 'sinarjaya', 'Epr2026!SinarJaya'),
    ('EPR-0054', 'heteroniaga', 'Epr2026!HeteroNiaga'),
    ('EPR-0267', 'harrisma', 'Epr2026!Harrisma'),
    ('EPR-0650', 'rajaprint', 'Epr2026!RajaPrint'),
    ('EPR-0733', 'microprinter', 'Epr2026!MicroPrinter'),
    ('EPR-0881', 'pixel', 'Epr2026!PixelSemarang'),
    ('EPR-1002', 'albumi', 'Epr2026!AlBumi'),
    ('EPR-1005', 'pribumijaya', 'Epr2026!PribumiJaya'),
    ('EPR-1197', 'yestoya', 'Epr2026!YestoyaAbadi'),
    ('EPR-1409', 'primakomputer', 'Epr2026!PrimaKomputer'),
    ('EPR-1410', 'safrindo', 'Epr2026!Safrindo'),
    ('EPR-1413', 'infokom', 'Epr2026!InfokomPutra'),
    ('EPR-1570', 'mitrapratama', 'Epr2026!MitraPratama'),
    ('EPR-1628', 'artadinata', 'Epr2026!Artadinata'),
    ('EPR-1768', 'karyahidupmulya', 'Epr2026!KaryaHidupMulya'),
    ('EPR-1770', 'putramandiri', 'Epr2026!PutraMandiri'),
    ('EPR-1816', 'salamjaya', 'Epr2026!SalamJaya'),
    ('EPR-1845', 'bumiraya', 'Epr2026!BumiRaya'),
    ('EPR-1906', 'ellite', 'Epr2026!ElliteWeleri'),
    ('EPR-1907', 'haiga', 'Epr2026!HaigaCitra'),
    ('EPR-1966', 'mitrasarana', 'Epr2026!MitraSarana'),
    ('EPR-1967', 'diamondindo', 'Epr2026!DiamondIndo'),
    ('EPR-1999', 'nafiri', 'Epr2026!NafiriSemarang'),
    ('EPR-2013', 'jayamakmur', 'Epr2026!JayaMakmur')
]

if use_admin:
    endpoint = f"{supabase_url.rstrip('/')}/auth/v1/admin/users"
    headers = {
        "apikey": active_key,
        "Authorization": f"Bearer {active_key}",
        "Content-Type": "application/json"
    }
    print(f"\n🚀 Mendaftarkan {len(stores_accounts)} akun melalui Admin API (Bebas Rate Limit)...")
else:
    endpoint = f"{supabase_url.rstrip('/')}/auth/v1/signup"
    headers = {
        "apikey": active_key,
        "Authorization": f"Bearer {active_key}",
        "Content-Type": "application/json"
    }
    print(f"\n⚠️ Mendaftarkan melalui Public Signup API...")

success_count = 0
for idx, (code, uname, pwd) in enumerate(stores_accounts, 1):
    email = f"{uname}@epr26.id"
    if use_admin:
        payload = {
            "email": email,
            "password": pwd,
            "email_confirm": True,
            "user_metadata": {
                "epr_code": code,
                "username": uname
            }
        }
    else:
        payload = {
            "email": email,
            "password": pwd,
            "data": {
                "epr_code": code,
                "username": uname
            }
        }
    
    try:
        resp = requests.post(endpoint, headers=headers, json=payload, timeout=10)
        if resp.status_code in [200, 201]:
            print(f"[{idx}/24] ✅ {code} | {uname} -> Sukses Terdaftar")
            success_count += 1
        elif "already registered" in resp.text or "already exists" in resp.text:
            print(f"[{idx}/24] ℹ️ {code} | {uname} -> Sudah pernah terdaftar (OK)")
            success_count += 1
        else:
            print(f"[{idx}/24] ⚠️ {code} | {uname} -> Gagal: {resp.text}")
    except Exception as e:
        print(f"[{idx}/24] ❌ {code} | {uname} -> Error koneksi: {e}")
    time.sleep(0.2)

print("\n" + "="*50)
print(f"🎉 Selesai! {success_count} dari {len(stores_accounts)} akun berhasil disiapkan.")
print("="*50)
