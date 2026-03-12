<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Report extends Model
{
    protected $fillable = [
        'report_code',
        'email_its',
        'jenis_kelamin',
        'status_korban',
        'jenis_kekerasan',
        'tanggal_kejadian',
        'waktu_kejadian',
        'lokasi_kejadian',
        'latitude',
        'longitude',
        'kronologi',
        'saksi',
        'sudah_lapor',
        'kontak_pelapor',
        'status',
    ];
}
 