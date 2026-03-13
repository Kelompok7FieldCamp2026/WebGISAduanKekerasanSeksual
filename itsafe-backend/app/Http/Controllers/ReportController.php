<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    // Terima laporan dari form
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email_its'       => 'nullable|email',
            'jenis_kelamin'   => 'required|in:Laki-laki,Perempuan',
            'status_korban'   => 'required|in:Mahasiswa,Dosen / Tendik,Lainnya (non-ITS)',
            'jenis_kekerasan' => 'required|in:Verbal,Non-verbal,Fisik,Pemerkosaan,Pencabulan,Lainnya',
            'tanggal_kejadian'=> 'required|date',
            'waktu_kejadian'  => 'required|in:Pagi,Siang,Malam',
            'lokasi_kejadian' => 'nullable|string',
            'latitude'        => 'nullable|numeric',
            'longitude'       => 'nullable|numeric',
            'kronologi'       => 'required|string',
            'saksi'           => 'nullable|string',
            'sudah_lapor'     => 'nullable|string',
            'kontak_pelapor'  => 'nullable|string',
        ]);

        // Generate kode unik laporan
        $validated['report_code'] = 'ITS-' . strtoupper(Str::random(8));
        $validated['status'] = 'pending';

        $report = Report::create($validated);

        return response()->json([
            'success'     => true,
            'message'     => 'Laporan berhasil dikirim!',
            'report_code' => $report->report_code,
        ], 201);
    }

    // Ambil semua laporan (untuk peta)
    public function index()
    {
        $reports = Report::select(
            'id', 'jenis_kelamin', 'jenis_kekerasan',
            'waktu_kejadian', 'lokasi_kejadian',
            'latitude', 'longitude', 'tanggal_kejadian', 'status'
        )->whereNotNull('latitude')->whereNotNull('longitude')->get();

        return response()->json($reports);
    }

    // Ambil semua laporan (untuk admin)
    public function adminIndex()
    {
        $reports = Report::orderBy('created_at', 'desc')->get();
        return response()->json($reports);
    }

    // Cek status laporan by kode
    public function checkStatus($code)
    {
        $report = Report::where('report_code', $code)
            ->select('report_code', 'status', 'jenis_kekerasan', 'created_at')
            ->first();

        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Kode laporan tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => $report]);
    }

    // Statistik untuk hero section
    public function stats()
    {
        $total = Report::count();
        $bulanIni = Report::whereMonth('created_at', now()->month)->count();
        $terverifikasi = Report::whereIn('status', ['resolved', 'verified'])->count();

        return response()->json([
            'total'        => $total,
            'bulan_ini'    => $bulanIni,
            'terverifikasi'=> $terverifikasi,
        ]);
    }

    // Update laporan (admin)
    public function update(Request $request, $id)
    {
        $report = Report::find($id);
        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Laporan tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'email_its'        => 'nullable|email',
            'jenis_kelamin'    => 'nullable|in:Laki-laki,Perempuan',
            'status_korban'    => 'nullable|in:Mahasiswa,Dosen / Tendik,Lainnya (non-ITS)',
            'jenis_kekerasan'  => 'nullable|in:Verbal,Non-verbal,Fisik,Pemerkosaan,Pencabulan,Lainnya',
            'tanggal_kejadian' => 'nullable|date',
            'waktu_kejadian'   => 'nullable|in:Pagi,Siang,Malam',
            'lokasi_kejadian'  => 'nullable|string',
            'latitude'         => 'nullable|numeric',
            'longitude'        => 'nullable|numeric',
            'kronologi'        => 'nullable|string',
            'saksi'            => 'nullable|string',
            'sudah_lapor'      => 'nullable|string',
            'kontak_pelapor'   => 'nullable|string',
            'status'           => 'nullable|in:pending,in_review,resolved,verified,rejected',
        ]);

        if (array_key_exists('status', $validated)) {
            if ($validated['status'] === 'verified') {
                $validated['status'] = 'resolved';
            } elseif ($validated['status'] === 'rejected') {
                $validated['status'] = 'in_review';
            }
        }

        $report->fill($validated);
        $report->save();

        return response()->json(['success' => true, 'data' => $report]);
    }

    // Hapus laporan (admin)
    public function destroy($id)
    {
        $report = Report::find($id);
        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Laporan tidak ditemukan.'], 404);
        }

        $report->delete();

        return response()->json(['success' => true]);
    }
}
