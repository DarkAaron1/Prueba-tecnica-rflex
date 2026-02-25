<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attendance_marks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('employee_rut')->index();
            $table->foreignId('device_id')->nullable()->constrained();
            
            $table->enum('source', ['clock', 'mobile', 'external_api']);
            $table->enum('type', ['in', 'out']); // Entrada o Salida
            
            $table->dateTime('timestamp')->index();
            
            // Hash único: RUT + Tipo + YYYY-MM-DD HH:mm
            // Esto evita que el mismo empleado marque Entrada dos veces en el mismo minuto
            $table->string('duplicate_hash')->unique(); 
            
            $table->json('metadata')->nullable(); // Para coordenadas GPS o info de la API externa
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('attendance_marks');
    }
};
