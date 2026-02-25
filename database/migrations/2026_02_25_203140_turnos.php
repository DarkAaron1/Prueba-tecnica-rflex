<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            
            $table->dateTime('scheduled_in')->index();
            $table->dateTime('scheduled_out');
            
            // Relación con las marcas (se llenan mediante el Job de 5 minutos)
            $table->foreignUuid('actual_in_id')->nullable()->references('id')->on('attendance_marks');
            $table->foreignUuid('actual_out_id')->nullable()->references('id')->on('attendance_marks');
            
            $table->enum('status', ['pending', 'present', 'absent', 'late', 'early_departure'])->default('pending');
            
            // Cálculos automáticos para reportes
            $table->integer('delay_minutes')->default(0);
            $table->integer('overtime_minutes')->default(0);
            $table->integer('undone_minutes')->default(0); // Horas no trabajadas
            
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('shifts');
    }
};
