<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('desc')->nullable();
            $table->enum('status', ['terpasang', 'rencana'])->default('rencana');
            $table->string('icon')->nullable();
            $table->integer('count')->default(0);
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('gmaps')->nullable();
            $table->longText('photo')->nullable();
            $table->timestamps();
        });

        // Seed default locations once (safe if table already has data)
        if (DB::table('locations')->count() === 0) {
            $now = now();
            DB::table('locations')->insert([
                [
                    'name' => 'Perpustakaan Pusat ITS',
                    'desc' => 'Area parkir dan lobi utama perpustakaan, zona keluar-masuk yang minim pengawasan.',
                    'status' => 'terpasang',
                    'count' => 3,
                    'icon' => 'fa-book-open',
                    'lat' => -7.2748,
                    'lng' => 112.7944,
                    'gmaps' => 'https://maps.google.com/?q=-7.2748,112.7944',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Gedung Teknik Sipil (FTSP)',
                    'desc' => 'Koridor lantai 2 dan area tangga belakang gedung.',
                    'status' => 'terpasang',
                    'count' => 5,
                    'icon' => 'fa-building-columns',
                    'lat' => -7.2771,
                    'lng' => 112.7963,
                    'gmaps' => 'https://maps.google.com/?q=-7.2771,112.7963',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Kantin Pusat (Food Court)',
                    'desc' => 'Area sekitar kantin pusat, terutama pada jam-jam sepi.',
                    'status' => 'terpasang',
                    'count' => 2,
                    'icon' => 'fa-utensils',
                    'lat' => -7.2756,
                    'lng' => 112.7951,
                    'gmaps' => 'https://maps.google.com/?q=-7.2756,112.7951',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Asrama Mahasiswa Putra',
                    'desc' => 'Koridor dan area parkir depan asrama putra ITS.',
                    'status' => 'terpasang',
                    'count' => 4,
                    'icon' => 'fa-house-user',
                    'lat' => -7.2735,
                    'lng' => 112.7938,
                    'gmaps' => 'https://maps.google.com/?q=-7.2735,112.7938',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Asrama Mahasiswa Putri',
                    'desc' => 'Pintu masuk utama dan taman asrama putri.',
                    'status' => 'terpasang',
                    'count' => 4,
                    'icon' => 'fa-house-user',
                    'lat' => -7.2745,
                    'lng' => 112.7955,
                    'gmaps' => 'https://maps.google.com/?q=-7.2745,112.7955',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Laboratorium Kimia (FMIPA)',
                    'desc' => 'Lorong penghubung antar laboratorium di gedung FMIPA.',
                    'status' => 'rencana',
                    'count' => 1,
                    'icon' => 'fa-flask',
                    'lat' => -7.2780,
                    'lng' => 112.7969,
                    'gmaps' => 'https://maps.google.com/?q=-7.2780,112.7969',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Lapangan Olahraga / GOR',
                    'desc' => 'Area tribun dan ruang ganti GOR ITS.',
                    'status' => 'rencana',
                    'count' => 0,
                    'icon' => 'fa-person-running',
                    'lat' => -7.2790,
                    'lng' => 112.7920,
                    'gmaps' => 'https://maps.google.com/?q=-7.2790,112.7920',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Gedung Robotika (Teknik Elektro)',
                    'desc' => 'Basement dan area parkir motor gedung Teknik Elektro.',
                    'status' => 'rencana',
                    'count' => 0,
                    'icon' => 'fa-microchip',
                    'lat' => -7.2760,
                    'lng' => 112.7980,
                    'gmaps' => 'https://maps.google.com/?q=-7.2760,112.7980',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Masjid Manarul Ilmi ITS',
                    'desc' => 'Area wudhu dan parkir belakang masjid.',
                    'status' => 'terpasang',
                    'count' => 1,
                    'icon' => 'fa-mosque',
                    'lat' => -7.2765,
                    'lng' => 112.7925,
                    'gmaps' => 'https://maps.google.com/?q=-7.2765,112.7925',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Gedung Rektorat ITS',
                    'desc' => 'Area lobby dan lorong menuju ruang tunggu layanan mahasiswa.',
                    'status' => 'rencana',
                    'count' => 0,
                    'icon' => 'fa-landmark',
                    'lat' => -7.2770,
                    'lng' => 112.7940,
                    'gmaps' => 'https://maps.google.com/?q=-7.2770,112.7940',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Co-working Space / Ruang Bersama',
                    'desc' => 'Area kerja bersama yang buka hingga larut malam.',
                    'status' => 'terpasang',
                    'count' => 2,
                    'icon' => 'fa-laptop',
                    'lat' => -7.2753,
                    'lng' => 112.7985,
                    'gmaps' => 'https://maps.google.com/?q=-7.2753,112.7985',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Area Parkir Timur',
                    'desc' => 'Parkiran motor dan mobil bagian timur kampus, minim pencahayaan malam.',
                    'status' => 'rencana',
                    'count' => 0,
                    'icon' => 'fa-square-parking',
                    'lat' => -7.2762,
                    'lng' => 112.7978,
                    'gmaps' => 'https://maps.google.com/?q=-7.2762,112.7978',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
