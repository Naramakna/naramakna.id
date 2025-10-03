import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardTabs } from '../../components/molecules/DashboardTabs';
import { AdminMataElang } from '../Admin/AdminMataElang';
import { buildApiUrl } from '../../config/api';

interface Gallery {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  photographer: string;
  location: string;
  story_date: string;
  view_count: number;
  published_at: string;
  created_by: number;
  photos: any[];
}

const PartnerFotografiDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const response = await fetch(buildApiUrl('mata-elang/my-galleries'), {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGalleries(data.data.galleries || []);
        }
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has partner_fotografi access
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.user_role !== 'partner_fotografi') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">
              Anda tidak memiliki akses ke dashboard partner fotografi.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                {user?.user_role === 'user' ?
                  'Untuk mengakses dashboard ini, Anda perlu mendaftar sebagai Partner Fotografi.' :
                  'Dashboard ini khusus untuk Partner Fotografi Naramakna.'
                }
              </p>
              {user?.user_role === 'user' && (
                <a
                  href="/profile/edit"
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Daftar Partner Fotografi
                </a>
              )}
            </div>
            <a
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-4"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Partner Fotografi</h1>
                <p className="text-gray-600">Selamat datang, {user.display_name}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Partner Fotografi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <DashboardTabs
              tabs={[
                { id: 'overview', name: 'Overview' },
                { id: 'galleries', name: 'Kelola Galeri', count: galleries.length },
                { id: 'panduan', name: 'Panduan' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              variant="photographer"
            />
          </div>

          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Ringkasan Aktivitas</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Galeri</p>
                      <p className="text-2xl font-semibold text-gray-900">{galleries.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Views</p>
                      <p className="text-2xl font-semibold text-green-600">
                        {galleries.reduce((total, gallery) => total + gallery.view_count, 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Foto</p>
                      <p className="text-2xl font-semibold text-yellow-600">
                        {galleries.reduce((total, gallery) => total + (gallery.photos?.length || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => setActiveTab('galleries')}
                    className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Buat Galeri Baru
                  </button>

                  <a
                    href="/kategori/mata-elang"
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat Halaman Mata Elang
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'galleries' && (
            <div className="p-6">
              <AdminMataElang />
            </div>
          )}

          {activeTab === 'panduan' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Panduan Penggunaan Icon</h2>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Pada halaman Kelola Galeri, kami menggunakan icon untuk menghemat ruang dan memberikan tampilan yang lebih rapi.
                      Berikut adalah penjelasan setiap icon yang tersedia:
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Kelola Foto */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Kelola Foto</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Membuka modal untuk menambah, mengedit, atau menghapus foto dalam galeri yang dipilih.
                  </p>
                </div>

                {/* Edit */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 p-2 bg-indigo-50 rounded-lg">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Edit Galeri</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Mengedit informasi galeri seperti judul, deskripsi, fotografer, lokasi, dan tanggal cerita.
                  </p>
                </div>

                {/* View */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Lihat Detail</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Melihat detail galeri tanpa dapat mengedit (muncul untuk galeri yang sudah diapprove admin).
                  </p>
                </div>

                {/* Submit */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Submit untuk Approval</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Mengirim galeri yang sudah selesai untuk ditinjau dan disetujui oleh admin.
                  </p>
                </div>

                {/* View Published */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Lihat Galeri Published</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Membuka galeri yang sudah dipublish di tab baru untuk melihat tampilan final di website.
                  </p>
                </div>
              </div>

              {/* Status Info */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Galeri</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 mr-3">
                      Belum Submit
                    </span>
                    <span className="text-sm text-gray-600">Galeri masih draft, belum dikirim ke admin</span>
                  </div>

                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-3">
                      Pending Approval
                    </span>
                    <span className="text-sm text-yellow-800">Menunggu persetujuan admin</span>
                  </div>

                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mr-3">
                      Published
                    </span>
                    <span className="text-sm text-green-800">Galeri sudah dipublikasi</span>
                  </div>

                  <div className="flex items-center p-3 bg-red-50 rounded-lg cursor-pointer" title="Klik status untuk lihat alasan penolakan">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mr-3">
                      Draft - Ditolak
                    </span>
                    <span className="text-sm text-red-800">Galeri ditolak admin</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Tips Penggunaan</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Hover mouse pada icon untuk melihat tooltip penjelasan</li>
                        <li>Pastikan menambahkan foto sebelum submit untuk approval</li>
                        <li>Klik status "Draft - Ditolak" untuk melihat alasan penolakan dari admin</li>
                        <li>Galeri yang sudah di-approve tidak dapat diedit lagi</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerFotografiDashboard;