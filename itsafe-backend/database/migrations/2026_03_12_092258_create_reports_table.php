<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_code', 20)->unique(); // kode unik untuk cek status

            // Data Pelapor
            $table->string('email_its')->nullable();
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan']);
            $table->enum('status_korban', ['Mahasiswa', 'Dosen / Tendik', 'Lainnya (non-ITS)']);

            // Data Kejadian
            $table->enum('jenis_kekerasan', ['Verbal', 'Non-verbal', 'Fisik', 'Pemerkosaan', 'Pencabulan', 'Lainnya']);
            $table->date('tanggal_kejadian');
            $table->enum('waktu_kejadian', ['Pagi', 'Siang', 'Malam']);
            $table->string('lokasi_kejadian')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('kronologi');
            $table->string('saksi')->nullable();

            // Tindak Lanjut
            $table->enum('sudah_lapor', ['Belum', 'Sudah – ditindaklanjuti', 'Sudah – tidak ditindaklanjuti'])->nullable();
            $table->string('kontak_pelapor')->nullable();

            // Status penanganan
            $table->enum('status', ['pending', 'in_review', 'resolved'])->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
