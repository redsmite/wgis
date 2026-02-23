<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permit_photos', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('permit_id');
            $table->string('filename');
            $table->string('original_name');
            $table->string('path');
            $table->enum('type', ['pdf', 'photo'])->default('photo');
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();

            $table->foreign('permit_id')->references('ID')->on('permits')->cascadeOnDelete();
            $table->index('permit_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permit_photos');
    }
};