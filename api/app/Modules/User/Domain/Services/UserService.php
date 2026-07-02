<?php

namespace App\Modules\User\Domain\Services;

use App\Modules\User\Domain\Models\User;
use App\Modules\User\Domain\Support\FilterQuery;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\User\Domain\Support\UserFilterRegistry;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(private readonly SalaryHistoryService $salaryHistoryService) {}

    /** @var list<string> */
    public const SORTABLE_COLUMNS = ['name', 'job_title', 'hired_at', 'email', 'salary', 'created_at'];

    /** @var list<string> */
    private const UPDATABLE_FIELDS = [
        'name', 'job_title', 'hired_at', 'email',
        'company_name', 'cnpj', 'cpf', 'rg', 'birth_date', 'phone',
        'zip_code', 'street', 'number', 'neighborhood', 'city', 'state',
        'contract_type', 'contracting_company',
        'emergency_contacts', 'bank_details', 'observations',
    ];

    private function extractAttributes(array $data): array
    {
        $attributes = [];

        foreach (self::UPDATABLE_FIELDS as $field) {
            if (array_key_exists($field, $data)) {
                $attributes[$field] = $data[$field];
            }
        }

        if (array_key_exists('manager_id', $data)) {
            $attributes['manager_id'] = $data['manager_id'];
        }

        if (array_key_exists('sector_id', $data)) {
            $attributes['sector_id'] = $data['sector_id'];
        }

        return $attributes;
    }

    private function syncBenefits(User $user, array $data): void
    {
        if (! array_key_exists('benefits', $data)) {
            return;
        }

        $user->benefits()->delete();

        foreach ($data['benefits'] as $benefitData) {
            if (empty($benefitData['name'])) {
                continue;
            }

            $user->benefits()->create([
                'name' => $benefitData['name'],
                'price' => $benefitData['price'] ?? 0,
            ]);
        }
    }

    /** @return LengthAwarePaginator<int, User> */
    public function paginate(SortQuery $sort, PaginationQuery $pagination, FilterQuery $filters): LengthAwarePaginator
    {
        $query = User::query()->with(['roles', 'manager', 'sector']);
        $filters->apply($query);
        $sort->apply($query);

        return $query->paginate(
            $pagination->perPage,
            ['*'],
            'page',
            $pagination->page,
        );
    }

    public function find(int $id): User
    {
        return User::query()
            ->with(['roles', 'manager', 'sector', 'benefits'])
            ->findOrFail($id);
    }

    /** @param  array{name: string, job_title: string, hired_at: string, salary: string|float|int, email: string, password: string, manager_id?: int|null, sector_id?: int|null, role_ids?: list<int>, benefits?: list<array{name: string, price?: float|string}>, ...}  $data */
    public function create(array $data, User $actor): User
    {
        $attributes = $this->extractAttributes($data);
        $attributes['salary'] = $data['salary'];
        $attributes['password'] = Hash::make($data['password']);

        $user = User::query()->create($attributes);

        if (! empty($data['role_ids'])) {
            $user->roles()->sync($data['role_ids']);
        }

        $this->syncBenefits($user, $data);

        $this->salaryHistoryService->recordInitial($user, $actor, [
            'new_salary' => $data['salary'],
            'effective_date' => $data['hired_at'],
        ]);

        VacationBalance::query()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'available_days' => 0,
                'accrued_days' => 0,
                'used_days' => 0,
                'additional_days' => 0,
            ],
        );

        return $user->load(['roles', 'manager', 'sector', 'benefits']);
    }

    /** @param  array{name?: string, job_title?: string, hired_at?: string, manager_id?: int|null, sector_id?: int|null, email?: string, password?: string|null, role_ids?: list<int>, benefits?: list<array{name: string, price?: float|string}>, ...}  $data */
    public function update(User $user, array $data): User
    {
        $attributes = $this->extractAttributes($data);

        if (! empty($data['password'])) {
            $attributes['password'] = Hash::make($data['password']);
        }

        if ($attributes !== []) {
            $user->update($attributes);
        }

        if (array_key_exists('role_ids', $data)) {
            $user->roles()->sync($data['role_ids']);
        }

        $this->syncBenefits($user, $data);

        return $user->load(['roles', 'manager', 'sector', 'benefits']);
    }

    public function delete(User $user, User $actor): void
    {
        if ($user->id === $actor->id) {
            abort(422, 'Você não pode excluir sua própria conta.');
        }

        $user->roles()->detach();
        $user->delete();
    }
}
