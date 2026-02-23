<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Create divisions table ─────────────────────────────────────
        Schema::create('divisions', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('division');
            $table->string('abbr')->nullable();
            $table->timestamps();
        });

        // ── 2. Populate from denr_ncr.systems_division ────────────────────
        $rows = DB::connection('denr_ncr')
            ->table('systems_division')
            ->get();

        foreach ($rows as $row) {
            DB::connection('mysql')->table('divisions')->insert([
                'id'         => $row->division_id,
                'division'   => $row->division,
                'abbr'       => $row->abbr ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ── 3. Change users.division_id to unsignedBigInteger then add FK ─
        Schema::table('users', function (Blueprint $table) {
            // Change from string to unsignedBigInteger to match divisions.id
            $table->unsignedBigInteger('division_id')->nullable()->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('division_id')
                  ->references('id')
                  ->on('divisions')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['division_id']);
            $table->string('division_id')->nullable()->change();
        });

        Schema::dropIfExists('divisions');
    }
};
