<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('salary');
            $table->string('cnpj', 18)->nullable()->after('company_name');
            $table->string('cpf', 14)->nullable()->after('cnpj');
            $table->string('rg', 20)->nullable()->after('cpf');
            $table->date('birth_date')->nullable()->after('rg');
            $table->string('phone', 20)->nullable()->after('birth_date');
            $table->string('zip_code', 9)->nullable()->after('phone');
            $table->string('street')->nullable()->after('zip_code');
            $table->string('number', 20)->nullable()->after('street');
            $table->string('neighborhood')->nullable()->after('number');
            $table->string('city')->nullable()->after('neighborhood');
            $table->string('state', 2)->nullable()->after('city');
            $table->string('contract_type', 20)->nullable()->after('state');
            $table->string('contracting_company')->nullable()->after('contract_type');
            $table->text('emergency_contacts')->nullable()->after('contracting_company');
            $table->text('bank_details')->nullable()->after('emergency_contacts');
            $table->text('observations')->nullable()->after('bank_details');
        });

        Schema::create('benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('benefits');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'company_name', 'cnpj', 'cpf', 'rg', 'birth_date', 'phone',
                'zip_code', 'street', 'number', 'neighborhood', 'city', 'state',
                'contract_type', 'contracting_company',
                'emergency_contacts', 'bank_details', 'observations',
            ]);
        });
    }
};
