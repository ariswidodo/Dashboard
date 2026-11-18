-- ==============================================================
-- SETUP TABEL & MASTER DATA 127 TOKO EPP FY26
-- ==============================================================

create table if not exists public.epp_stores (
  id uuid primary key default gen_random_uuid(),
  epp_code text unique not null,
  epp_name text not null,
  company_name text,
  territory text,
  area text,
  city text,
  area_type text,
  username text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.epp_stores enable row level security;
grant all on table public.epp_stores to anon, authenticated;

-- RLS epp_stores
drop policy if exists "EPP view policy" on public.epp_stores;
create policy "EPP view policy"
on public.epp_stores for select
using (
  auth.jwt() ->> 'email' = 'admin@epr26.id'
  or (auth.jwt() -> 'user_metadata' ->> 'role') in ('admin', 'epp')
  or auth.uid() = user_id
  or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
);

-- RLS epr_stores: Izinkan akun role 'epp' untuk membaca performa toko retail (EPR)
drop policy if exists "Store view own profile" on public.epr_stores;
create policy "Store view own profile"
on public.epr_stores for select
using (
  auth.jwt() ->> 'email' = 'admin@epr26.id'
  or (auth.jwt() -> 'user_metadata' ->> 'role') in ('admin', 'epp')
  or auth.uid() = user_id 
  or lower(username) = lower(split_part(auth.jwt() ->> 'email', '@', 1))
);

-- RLS sales_records: Izinkan role 'epp' untuk melihat data pembelian/penjualan akumulasi EPR
drop policy if exists "Store sales access" on public.sales_records;
create policy "Store sales access"
on public.sales_records for all
using (
  auth.jwt() ->> 'email' = 'admin@epr26.id'
  or (auth.jwt() -> 'user_metadata' ->> 'role') in ('admin', 'epp')
  or store_id in (select id from public.epr_stores where user_id = auth.uid())
)
with check (
  auth.jwt() ->> 'email' = 'admin@epr26.id'
  or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  or store_id in (select id from public.epr_stores where user_id = auth.uid())
);

-- Masukkan 127 Data Master EPP
insert into public.epp_stores (
  epp_code, territory, area, city, epp_name, company_name, area_type, username
) values
  ('EPP-0002', 'CENTRAL', 'Jakarta', 'Jakarta', 'ARTA MUARA', 'PT ARTA MUARA CEMERLANG', 'CROSS', 'artamuara'),
  ('EPP-0003', 'CENTRAL', 'Jakarta', 'Jakarta', 'ASNI COMPUTER', 'PT KARYA ADHI GEMILANG', 'CROSS', 'asnicomputer'),
  ('EPP-0005', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT DIGITEC JAYA INDONESIA', 'PT DIGITEC JAYA INDONESIA', 'CROSS', 'digitecjayaindonesia'),
  ('EPP-0006', 'CENTRAL', 'Jakarta', 'Jakarta', 'FLEXIPOS MITRA ABADI', 'PT FLEXIPOS MITRA ABADI', 'CROSS', 'flexiposmitraabadi'),
  ('EPP-0007', 'CENTRAL', 'Jakarta', 'Jakarta', 'INDO BHAKTI UTAMA', 'PT MITRA INDO BHAKTI UTAMA', 'CROSS', 'indobhaktiutama'),
  ('EPP-0008', 'CENTRAL', 'Jakarta', 'Jakarta', 'INTI DATA COMPUTER', 'PT INTIDATA SUPPLIES', 'CROSS', 'intidatacomputer'),
  ('EPP-0009', 'CENTRAL', 'Jakarta', 'Jakarta', 'IS TECHNOLOGY', 'PT IS PRATAMA ABADI', 'CROSS', 'istechnology'),
  ('EPP-0012', 'CENTRAL', 'Jakarta', 'Jakarta', 'MAKRO IT', 'PT MAKRO INFORMASI TEKNOLOGI', 'CROSS', 'makroit'),
  ('EPP-0014', 'CENTRAL', 'Jakarta', 'Jakarta', 'MEGATRONIX', 'PT MEGATRONIX MITRANIAGA', 'CROSS', 'megatronix'),
  ('EPP-0015', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT MILENIA MULTIVISI', 'PT MILENIA MULTIVISI', 'CROSS', 'mileniamultivisi'),
  ('EPP-0016', 'CENTRAL', 'Jakarta', 'Jakarta', 'MULTI BERKAT COMPUTER', 'PT KARISA SUKSES ABADI', 'CROSS', 'multiberkatcomputer'),
  ('EPP-0017', 'CENTRAL', 'Jakarta', 'Jakarta', 'PROSHOP', 'PT PROSHOP MEGA JAYA', 'CROSS', 'proshop'),
  ('EPP-0018', 'CENTRAL', 'Jakarta', 'Jakarta', 'PANCA CIPTA LESTARI', 'PT PRATAMA CIPTA LESTARINDO', 'CROSS', 'pancaciptalestari'),
  ('EPP-0019', 'CENTRAL', 'Jakarta', 'Jakarta', 'PHOENIXINDO SARANA INFORMATIKA', 'PT RAJAWALI MAHKOTA TEKNOLOGI', 'CROSS', 'phoenixindosaranainformatika'),
  ('EPP-0020', 'CENTRAL', 'Jakarta', 'Jakarta', 'PLAZA COMP', 'PT PRIMROSE CEMERLANG LESTARI', 'CROSS', 'plazacomp'),
  ('EPP-0022', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT KHATULISTIWA JAYASAKTI ABADI (PROMUDIA)', 'PT KHATULISTIWA JAYASAKTI ABADI', 'CROSS', 'khatulistiwajayasaktiabadipromudia'),
  ('EPP-0025', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT HARYA PILAR UTAMA SUKSES', 'PT HARYA PILAR UTAMA SUKSES', 'CROSS', 'haryapilarutamasukses'),
  ('EPP-0029', 'CENTRAL', 'Jakarta', 'Jakarta', 'RIA DATA CENTRE', 'PT DATA JAYA ABADI', 'CROSS', 'riadatacentre'),
  ('EPP-0033', 'CENTRAL', 'Jakarta', 'Jakarta', 'SUPER COMPUTER', 'TAKE OUT FY26', 'CROSS', 'supercomputer'),
  ('EPP-0034', 'CENTRAL', 'Jakarta', 'Jakarta', 'TEGUH KOMPUTAMA', 'PT TEGUH KOMPUTAMA', 'CROSS', 'teguhkomputama'),
  ('EPP-0036', 'CENTRAL', 'Jakarta', 'Jakarta', 'VIN SOLUSINDO', 'PT VIN SOLUSI COMPUTAMA', 'CROSS', 'vinsolusindo'),
  ('EPP-0038', 'CENTRAL', 'Jawa Barat', 'Bogor', 'PT ZOOM INFOTEK TELESINDO', 'TAKE OUT FY23', 'CROSS', 'zoominfotektelesindo'),
  ('EPP-0040', 'SOUTH WEST', 'Jawa Barat', 'Bandung', 'PT ANEKA NIAGA GLOBAL', 'PT ANEKA NIAGA GLOBAL', 'CROSS', 'anekaniagaglobal'),
  ('EPP-0041', 'SOUTH WEST', 'Jawa Barat', 'Bandung', 'PT SARANA SOLUSINDO SEJATI', 'TAKE OUT FY25', 'CROSS', 'saranasolusindosejati'),
  ('EPP-0044', 'SOUTH WEST', 'Jawa Barat', 'Bandung', 'MEGACOM', 'CV MEGA', 'CROSS', 'megacom'),
  ('EPP-0048', 'SOUTH WEST', 'Jawa Barat', 'Bandung', 'TIXIN BANDUNG/MASSCOM', 'TAKE OUT FY24', 'CROSS', 'tixinbandungmasscom'),
  ('EPP-0050', 'SOUTH WEST', 'Jawa Tengah', 'Yogyakarta', 'COMPUTA', 'CV COMPUTA', 'LOCAL', 'computa'),
  ('EPP-0055', 'SOUTH WEST', 'Jawa Tengah', 'Yogyakarta', 'TOP DISTRIBUSI', 'CV TOP DISTRIBUSI', 'LOCAL', 'topdistribusi'),
  ('EPP-0056', 'SOUTH WEST', 'Jawa Tengah', 'Semarang', 'COMPUMART', 'PT COMPUTEK INFOMART INDONESIA', 'LOCAL', 'compumart'),
  ('EPP-0057', 'SOUTH WEST', 'Jawa Tengah', 'Semarang', 'HERMON', 'TAKE OUT FY22', 'LOCAL', 'hermon'),
  ('EPP-0058', 'SOUTH WEST', 'Jawa Tengah', 'Semarang', 'CV YESTOYA ABADI', 'CV YESTOYA ABADI', 'LOCAL', 'yestoyaabadi'),
  ('EPP-0063', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'ABADI CIPTA KOMPUTER', 'CV ANEKA CEMERLANG KOMPUTER', 'CROSS', 'abadiciptakomputer'),
  ('EPP-0065', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'MESIN KASIR ONLINE', 'PT KODE NIAGA TAMA', 'CROSS', 'mesinkasironline'),
  ('EPP-0067', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'HARAPAN JAYA COMPUTER CENTER', 'PT SURYA MAKMUR KREASINDO', 'CROSS', 'harapanjayacomputercenter'),
  ('EPP-0068', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'KREASINDO CIPTA NUSANTARA', 'PT KREASINDO CIPTA NUSANTARA', 'CROSS', 'kreasindociptanusantara'),
  ('EPP-0069', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'MULTI SARANA COMPUTER', 'PT MULTI SARANA COMPUTER', 'CROSS', 'multisaranacomputer'),
  ('EPP-0071', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'SURYA SATWIKA', 'PT SURYA SATWIKA', 'CROSS', 'suryasatwika'),
  ('EPP-0072', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'RAYA PERSADA', 'PT RAYA PERSADA SOLUSINDO', 'CROSS', 'rayapersada'),
  ('EPP-0076', 'NORTH WEST', 'Sumatera', 'Medan', 'GOLDEN DRAGON COMPUTER', 'CV METRO ELEKTRONIK', 'CROSS', 'goldendragoncomputer'),
  ('EPP-0078', 'NORTH WEST', 'Sumatera', 'Padang', 'SINAR MULIA', 'PT SINARMULIA ANDALAS INFOCOM', 'CROSS', 'sinarmulia'),
  ('EPP-0079', 'NORTH WEST', 'Sumatera', 'Medan', 'ABC COMPUTER', 'CV ABC ASIA', 'CROSS', 'abccomputer'),
  ('EPP-0081', 'NORTH WEST', 'Sumatera', 'Palembang', 'BOBBY COMPUTER', 'CV BOBBY PUTRA PRATAMA', 'CROSS', 'bobbycomputer'),
  ('EPP-0083', 'NORTH WEST', 'Sumatera', 'Palembang', 'PT MULTI DATA PALEMBANG', 'PT MULTI DATA PALEMBANG', 'CROSS', 'multidatapalembang'),
  ('EPP-0084', 'NORTH WEST', 'Sumatera', 'Palembang', 'MULTIKOM', 'CV MULTIKOM', 'CROSS', 'multikom'),
  ('EPP-0085', 'NORTH WEST', 'Sumatera', 'Pekanbaru', 'CV RETYAN COMPUTER', 'CV RETYAN COMPUTER', 'CROSS', 'retyancomputer'),
  ('EPP-0086', 'NORTH WEST', 'Sumatera', 'Pekanbaru', 'PT DWIWIRA  PUTRADINAMIKA', 'PT DWIWIRA PUTRA DINAMIKA', 'CROSS', 'dwiwiraputradinamika'),
  ('EPP-0088', 'SOUTH WEST', 'Kalimantan', 'Balikpapan', 'WIDYA WISESA', 'CV WIDYA WISESA', 'CROSS', 'widyawisesa'),
  ('EPP-0089', 'SOUTH WEST', 'Kalimantan', 'Pontianak', 'PT ANEKA MULTI SUKSES ABADI', 'TAKE OUT FY26', 'CROSS', 'anekamultisuksesabadi'),
  ('EPP-0091', 'SOUTH WEST', 'Kalimantan', 'Pontianak', 'PT IT SOLUSINDO', 'PT IT SOLUSINDO', 'CROSS', 'itsolusindo'),
  ('EPP-0092', 'SOUTH WEST', 'Kalimantan', 'Samarinda', 'LIDATA COMPUTER', 'CV LIDATA COMPUTER', 'CROSS', 'lidatacomputer'),
  ('EPP-0093', 'NORTH EAST', 'Sulawesi', 'Makassar', 'ARIEL COMPUTER', 'PT ARIEL CREATIVE ELEVATION', 'CROSS', 'arielcomputer'),
  ('EPP-0094', 'NORTH EAST', 'Sulawesi', 'Makassar', 'CAHAYA SURYA COMPUTER', 'CV CAHAYA SURYA KOMPUTER', 'CROSS', 'cahayasuryacomputer'),
  ('EPP-0099', 'NORTH EAST', 'Sulawesi', 'Manado', 'MEGAKOMP', 'CV MEGA INFORMASI', 'CROSS', 'megakomp'),
  ('EPP-0100', 'NORTH WEST', 'Sumatera', 'Jambi', 'CV ANDIKA SURAYA KOMPUTER', 'TAKE OUT FY23', 'CROSS', 'andikasurayakomputer'),
  ('EPP-0101', 'NORTH WEST', 'Sumatera', 'Jambi', 'ELEVEN KOMPUTER', 'PT ELEVEN KOMPUTER', 'CROSS', 'elevenkomputer'),
  ('EPP-0105', 'SOUTH EAST', 'Bali', 'Denpasar', 'CENTRALINDO COMPUTER', 'CV ANEKA PIRANTI CIPTA', 'CROSS', 'centralindocomputer'),
  ('EPP-0111', 'CENTRAL', 'Jakarta', 'Jakarta', 'CV MULTICASA', 'CV MULTICASA', 'CROSS', 'multicasa'),
  ('EPP-0113', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT GA TIGA BELAS', 'TAKE OUT FY23', 'CROSS', 'gatigabelas'),
  ('EPP-0114', 'SOUTH WEST', 'Jawa Tengah', 'Semarang', 'CV MULTI CASA SEMARANG', 'TAKE OUT FY23', 'LOCAL', 'multicasasemarang'),
  ('EPP-0117', 'NORTH EAST', 'Sulawesi', 'Makassar', 'UD VICTORIA', 'PT VICTORIA JAYA KOMPUTAMA', 'CROSS', 'victoria'),
  ('EPP-0120', 'SOUTH WEST', 'Jawa Tengah', 'Semarang', 'CV MEDIA INOVASI', 'CV GLOBAL KARUNIA TECHNOLOGY', 'LOCAL', 'mediainovasi'),
  ('EPP-0133', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'CV WUJUD UNGGUL', 'CV WUJUD UNGGUL', 'CROSS', 'wujudunggul'),
  ('EPP-0135', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT ANEKA WARNA INDAH', 'PT ANEKA WARNA INDAH', 'CROSS', 'anekawarnaindah'),
  ('EPP-0139', 'CENTRAL', 'Jakarta', 'Jakarta', 'CV X-COM MEDIA', 'CV X-COM MEDIA', 'CROSS', 'xcommedia'),
  ('EPP-0140', 'SOUTH EAST', 'Bali', 'Denpasar', 'CV AYU WIRA', 'CV AYU WIRA', 'CROSS', 'ayuwira'),
  ('EPP-0142', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'PERSADA ARTHA PRIMA', 'TAKE OUT FY21', 'CROSS', 'persadaarthaprima'),
  ('EPP-0143', 'SOUTH WEST', 'Jawa Barat', 'Bandung', 'CV PRIMATECH VISINDO', 'CV PRIMATECH VISINDO', 'CROSS', 'primatechvisindo'),
  ('EPP-0144', 'SOUTH WEST', 'Jawa Tengah', 'Yogyakarta', 'CV SINAR ABADI MULTIMEDIA', 'CV SINAR ABADI MULTIMEDIA', 'LOCAL', 'sinarabadimultimedia'),
  ('EPP-0145', 'SOUTH WEST', 'Kalimantan', 'Banjarmasin', 'CV DATACOM BANJARMASIN', 'CV DATACOM', 'CROSS', 'datacombanjarmasin'),
  ('EPP-0146', 'SOUTH WEST', 'Jawa Tengah', 'Solo', 'PT SADAR JAYA MANDIRI', 'TAKE OUT FY24', 'LOCAL', 'sadarjayamandiri'),
  ('EPP-0147', 'NORTH EAST', 'Sulawesi', 'Makassar', 'SINAR LASER COMPUTER', 'CV LASER COMPUTINDO', 'CROSS', 'sinarlasercomputer'),
  ('EPP-0148', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'LOGIDATA', 'PT LOGI DATA TEKNOLOGI', 'CROSS', 'logidata'),
  ('EPP-0150', 'NORTH EAST', 'Sulawesi', 'Makassar', 'KOMETINDO', 'PT KOMETINDO KOMPUTAMA', 'CROSS', 'kometindo'),
  ('EPP-0151', 'SOUTH WEST', 'Kalimantan', 'Banjarmasin', 'MULTI PRIMA', 'PT BORNEO PRIMA UTAMA JAYA', 'CROSS', 'multiprima'),
  ('EPP-0155', 'SOUTH WEST', 'Jawa Barat', 'Bandung', 'COMPUMAX', 'CV COMPUMAX MITRA SEJATI', 'CROSS', 'compumax'),
  ('EPP-0160', 'CENTRAL', 'Jakarta', 'Jakarta', 'CENTRAL BARCODE SOLUSINDO', 'PT CENTRALTECH GLOBAL SOLUSI', 'CROSS', 'centralbarcodesolusindo'),
  ('EPP-0168', 'SOUTH WEST', 'Jawa Barat', 'Bandung', 'PT VISUAL INDO PERKASA', 'TAKE OUT FY23', 'CROSS', 'visualindoperkasa'),
  ('EPP-0169', 'CENTRAL', 'Jakarta', 'Jakarta', 'DATA RETAIL SOLUTION', 'PT DATA RETAIL SOLUTION', 'CROSS', 'dataretailsolution'),
  ('EPP-0171', 'SOUTH WEST', 'Jawa Tengah', 'Semarang', 'SADHANA COMPUTER', 'TAKE OUT FY22', 'LOCAL', 'sadhanacomputer'),
  ('EPP-0172', 'SOUTH EAST', 'Jawa Timur', 'Malang', 'PT FOCUS INFOTAMA', 'CV TUNAS ABADI', 'CROSS', 'focusinfotama'),
  ('EPP-0181', 'SOUTH WEST', 'Jawa Tengah', 'Solo', 'CV TUNAS ORCHID PRATAMA', 'CV TUNGGAL OPTI PERSADA', 'LOCAL', 'tunasorchidpratama'),
  ('EPP-0183', 'NORTH WEST', 'Kepri', 'Batam', 'CV MURACOM', 'PT KARYA MURA NIAGA', 'CROSS', 'muracom'),
  ('EPP-0186', 'CENTRAL', 'Jakarta', 'Jakarta', 'ASCOM', 'PT YAKIN ANUGERAH PERKASA', 'CROSS', 'ascom'),
  ('EPP-0187', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT PASSWORD RITEL SISTEM INDONESIA', 'PT PASSWORD RITEL SISTEM INDONESIA', 'CROSS', 'passwordritelsistemindonesia'),
  ('EPP-0194', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT SAMAFITRO', 'PT SAMAFITRO', 'CROSS', 'samafitro'),
  ('EPP-0196', 'CENTRAL', 'Jakarta', 'Jakarta', 'MASTER MEDIA', 'PT MASTERMEDIA UTAMA', 'CROSS', 'mastermedia'),
  ('EPP-0197', 'SOUTH WEST', 'Kalimantan', 'Banjarmasin', 'LION COMPUTER', 'TAKE OUT FY23', 'CROSS', 'lioncomputer'),
  ('EPP-0198', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT. FESTINO INDONESIA', 'PT FESTINO INDONESIA', 'CROSS', 'ptfestinoindonesia'),
  ('EPP-0200', 'NORTH WEST', 'Sumatera', 'Padang', 'CV J-BROS', 'PT SEMANGAT BERKAT JAYA', 'CROSS', 'jbros'),
  ('EPP-0201', 'CENTRAL', 'Jakarta', 'Jakarta', 'EGP COMPUTER', 'TAKE OUT FY26', 'CROSS', 'egpcomputer'),
  ('EPP-0202', 'NORTH WEST', 'Kepri', 'Batam', 'PT. TERANG INTI SEJAHTERA', 'TAKE OUT FY26', 'CROSS', 'ptterangintisejahtera'),
  ('EPP-0203', 'NORTH WEST', 'Sumatera', 'Medan', 'IT MASTER', 'TAKE OUT FY23', 'CROSS', 'itmaster'),
  ('EPP-0207', 'SOUTH WEST', 'Jawa Barat', 'Bandung', 'PT LIEMARGA EKAPUTRA MANDIRI', 'PT LIEMARGA EKAPUTRA MANDIRI', 'CROSS', 'liemargaekaputramandiri'),
  ('EPP-0208', 'CENTRAL', 'Jakarta', 'Jakarta', 'CV MEDIA GRAFINDO', 'PT DIGITAL MEDIA GRAFINDO', 'CROSS', 'mediagrafindo'),
  ('EPP-0209', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT INDONESIA GRAPHIC', 'TAKE OUT FY24', 'CROSS', 'indonesiagraphic'),
  ('EPP-0212', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT MULIA MANDIRI SUPPLY', 'PT MULIA MANDIRI SUPPLY', 'CROSS', 'muliamandirisupply'),
  ('EPP-0220', 'CENTRAL', 'Jawa Barat', 'Serpong', 'BAHAGIA SEJAHTERA KOMPUTER (BAHTERA KOMPUTER)', 'TAKE OUT FY21', 'CROSS', 'bahagiasejahterakomputerbahterakomputer'),
  ('EPP-0229', 'SOUTH WEST', 'Kalimantan', 'Pontianak', '', 'PT INTER RAYA KOMPUTAMA', 'CROSS', 'epp0229'),
  ('EPP-0230', 'SOUTH WEST', 'Kalimantan', 'Samarinda', 'CV MITRA JAYA MANDIRI', 'CV PRIMA TEKNOLOGI CANDRA', 'CROSS', 'mitrajayamandiri'),
  ('EPP-0231', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT DARMAWAN OPTIMA PROJEKTOR', 'PT DARMAWAN OPTIMA PROJEKTOR', 'CROSS', 'darmawanoptimaprojektor'),
  ('EPP-0211', 'SOUTH WEST', 'Jawa Tengah', 'Solo', 'CV SINAR CITRA PRATAMA', 'CV SINAR CITRA PRATAMA', 'LOCAL', 'sinarcitrapratama'),
  ('EPP-0210', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT MANDIRI ARTHA SOLUSI', 'PT MANDIRI ARTHA SOLUSI', 'CROSS', 'mandiriarthasolusi'),
  ('EPP-0232', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT  INTER DELTA TBK.', 'PT INTER DELTA TBK.', 'CROSS', 'interdeltatbk'),
  ('EPP-0233', 'SOUTH WEST', 'Jawa Barat', 'Bandung', 'PT SARANA SOLUSINDO SEJATI', 'PT GREAT PRIMA LESTARI', 'CROSS', 'saranasolusindosejati2'),
  ('EPP-0234', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT ITKLIK INDONESIA', 'PT ITKLIK INDONESIA', 'CROSS', 'itklikindonesia'),
  ('EPP-0235', 'CENTRAL', 'Jakarta', 'Jakarta', 'UD JAYA UTAMA', 'PT JAYA UTAMA COM', 'CROSS', 'jayautama'),
  ('EPP-0236', 'NORTH EAST', 'Sulawesi', 'Manado', 'CV HARMONI SUKSES MANDIRI', 'CV HARMONI SUKSES MANDIRI', 'CROSS', 'harmonisuksesmandiri'),
  ('EPP-0237', 'NORTH EAST', 'Sulawesi', 'Gorontalo', 'PT PROSHOP PRIMA SINERGI', 'TAKE OUT FY22', 'CROSS', 'proshopprimasinergi'),
  ('EPP-0239', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT MULTI MASTER MANDIRI', 'TAKE OUT FY22', 'CROSS', 'multimastermandiri'),
  ('EPP-0240', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT GRAHA SARANA INFOTAMA', 'PT GRAHA MEDIA KOMPUTAMA', 'CROSS', 'grahasaranainfotama'),
  ('EPP-0241', 'CENTRAL', 'Jawa Barat', 'Tangerang', 'PT. LAYSANDER TECHNOLOGY', 'PT LAYSANDER TECHNOLOGY', 'CROSS', 'ptlaysandertechnology'),
  ('EPP-0242', 'SOUTH WEST', 'Jawa Barat', 'Bandung', 'CV WIJAYA MANDIRI', 'PT JESSTECH KEREN BANGET', 'CROSS', 'wijayamandiri'),
  ('EPP-0243', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT IMAGO INOVASI INDONESIA', 'TAKE OUT FY23', 'CROSS', 'imagoinovasiindonesia'),
  ('EPP-0244', 'SOUTH WEST', 'Jawa Tengah', 'Semarang', 'HERMON', 'TAKE OUT FY22', 'LOCAL', 'hermon2'),
  ('EPP-0245', 'SOUTH WEST', 'Jawa Tengah', 'Yogyakarta', 'PT PARON INDONESIA', 'PT RAKA PERKASA TEKNOLOGI', 'LOCAL', 'paronindonesia'),
  ('EPP-0246', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'CV CITRA SARANA SOLUSI', 'CV DUTA SARANA SEJAHTERA', 'CROSS', 'citrasaranasolusi'),
  ('EPP-0247', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'CV. 7 DROPLET', 'CV 7 DROPLET', 'CROSS', 'cv7droplet'),
  ('EPP-0248', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT ACA PACIFIC', 'TAKE OUT FY23', 'CROSS', 'acapacific'),
  ('EPP-0249', 'CENTRAL', 'Jakarta', 'Jakarta', 'CV TOPSON INDONESIA', 'CV TOPSON INDONESIA', 'CROSS', 'topsonindonesia'),
  ('EPP-0250', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT SAKATA INX INDONESIA', 'TAKE OUT FY23', 'CROSS', 'sakatainxindonesia'),
  ('EPP-0251', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT KREASI SARANA PRIMA', 'TAKE OUT FY23', 'CROSS', 'kreasisaranaprima'),
  ('EPP-0252', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT MAHA DANA WIKASITA', 'TAKE OUT FY23', 'CROSS', 'mahadanawikasita'),
  ('EPP-0253', 'CENTRAL', 'Jawa Barat', 'Bekasi', 'PT SOLUSI SUKSES PRATAMA', 'TAKE OUT FY23', 'CROSS', 'solusisuksespratama'),
  ('EPP-0254', 'CENTRAL', 'Jakarta', 'Jakarta', 'PT PILAR GLOBAL SOLUSI', 'TAKE OUT FY23', 'CROSS', 'pilarglobalsolusi'),
  ('EPP-0255', 'SOUTH EAST', 'Jawa Timur', 'Surabaya', 'PT GADING MURNI', 'PT GADING MURNI', 'CROSS', 'gadingmurni'),
  ('EPP-0256', 'NORTH WEST', 'Sumatera', 'Medan', 'PT HARSA MASTERINDO TEKNOLOGI', 'PT HARSA MASTERINDO TEKNOLOGI', 'CROSS', 'harsamasterindoteknologi'),
  ('EPP-0257', 'CENTRAL', 'Jawa Barat', 'Bekasi', 'PT XYZ GOPRINT INDONESIA', 'TAKE OUT FY26', 'CROSS', 'xyzgoprintindonesia')
on conflict (epp_code) do update set
  territory = excluded.territory,
  area = excluded.area,
  city = excluded.city,
  epp_name = excluded.epp_name,
  company_name = excluded.company_name,
  area_type = excluded.area_type,
  username = excluded.username;

notify pgrst, 'reload schema';
