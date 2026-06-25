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

    /** @return LengthAwarePaginator<int, User> */
    public function paginate(SortQuery $sort, PaginationQuery $pagination, FilterQuery $filters): LengthAwarePaginator
    {
        $query = User::query()->with(['roles', 'manager']);
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
            ->with(['roles', 'manager'])
            ->findOrFail($id);
    }

    /** @param  array{name: string, job_title: string, hired_at: string, manager_id?: int|null, salary: string|float|int, email: string, password: string, role_ids?: list<int>}  $data */
    public function create(array $data, User $actor): User
    {
        $user = User::query()->create([
            'name' => $data['name'],
            'job_title' => $data['job_title'],
            'hired_at' => $data['hired_at'],
            'manager_id' => $data['manager_id'] ?? null,
            'salary' => $data['salary'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        if (! empty($data['role_ids'])) {
            $user->roles()->sync($data['role_ids']);
        }

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

        return $user->load(['roles', 'manager']);
    }

    /** @param  array{name?: string, job_title?: string, hired_at?: string, manager_id?: int|null, email?: string, password?: string|null, role_ids?: list<int>}  $data */
    public function update(User $user, array $data): User
    {
        $attributes = [];

        foreach (['name', 'job_title', 'hired_at', 'email'] as $field) {
            if (array_key_exists($field, $data)) {
                $attributes[$field] = $data[$field];
            }
        }

        if (array_key_exists('manager_id', $data)) {
            $attributes['manager_id'] = $data['manager_id'];
        }

        if (! empty($data['password'])) {
            $attributes['password'] = Hash::make($data['password']);
        }

        if ($attributes !== []) {
            $user->update($attributes);
        }

        if (array_key_exists('role_ids', $data)) {
            $user->roles()->sync($data['role_ids']);
        }

        return $user->load(['roles', 'manager']);
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
