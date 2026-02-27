<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete(); // Sucursal
            $table->foreignId('area_id')->constrained()->cascadeOnDelete();   // Área
            $table->string('rut')->unique()->index();
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained();
            $table->string('name');
            $table->string('serial_number')->unique();
            $table->enum('type', ['biometric', 'gateway', 'virtual']);
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
        Schema::dropIfExists('employees');
    }
};
