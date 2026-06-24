import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { applyApiErrors } from "../lib/applyApiErrors";
import { toInputDate } from "../lib/format";
import * as aclService from "../services/aclService";
import { ApiError } from "../services/api";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { DatePicker } from "../components/ui/DatePicker";
import { FormActions } from "../components/ui/FormActions";
import { Input } from "../components/ui/Input";
import { MultiSelect } from "../components/ui/MultiSelect";
import { PageHeader } from "../components/ui/PageHeader";
import { UserSalaryHistorySection } from "../components/users/UserSalaryHistorySection";
import { SearchSelect } from "../components/ui/SearchSelect";
import { formatSalary } from "../lib/format";
import { UserVacationSection } from "../components/users/UserVacationSection";

const userFormSchema = z.object({
  name: z.string().min(1, "Informe o nome."),
  job_title: z.string().min(1, "Informe o cargo."),
  hired_at: z.string().min(1, "Informe a data de contratação."),
  manager_id: z.number().nullable(),
  salary: z
    .number()
    .min(0, "A remuneração deve ser maior ou igual a zero.")
    .optional(),
  email: z
    .string()
    .min(1, "Informe o e-mail.")
    .email("Informe um e-mail válido."),
  password: z.string().optional(),
  role_ids: z.array(z.number()),
});

type UserFormValues = z.infer<typeof userFormSchema>;

function createUserFormSchema(isEditing: boolean) {
  return userFormSchema.superRefine((values, context) => {
    if (!isEditing && values.salary === undefined) {
      context.addIssue({
        code: "custom",
        message: "Informe a remuneração.",
        path: ["salary"],
      });
    }

    if (!isEditing && (!values.password || values.password.length < 8)) {
      context.addIssue({
        code: "custom",
        message: "A senha deve ter no mínimo 8 caracteres.",
        path: ["password"],
      });
    }

    if (isEditing && values.password && values.password.length < 8) {
      context.addIssue({
        code: "custom",
        message: "A senha deve ter no mínimo 8 caracteres.",
        path: ["password"],
      });
    }
  });
}

export function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = id ? Number(id) : null;
  const isEditing = userId !== null && !Number.isNaN(userId);
  const [formError, setFormError] = useState<string | null>(null);

  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => aclService.getUser(userId!),
    enabled: isEditing,
  });

  const rolesQuery = useQuery({
    queryKey: ["roles", "name:asc"],
    queryFn: () =>
      aclService.listRoles({
        sorts: [{ column: "name", direction: "asc" }],
        per_page: 50,
      }),
  });

  const searchManagers = useCallback(
    async (query: string) => {
      const response = await aclService.listUsers({
        filters: {
          search: query.trim() === "" ? undefined : query,
          exclude_id: userId ?? undefined,
        },
        sorts: [{ column: "name", direction: "asc" }],
        per_page: 15,
      });

      return response.data.map((collaborator) => ({
        value: collaborator.id,
        label: collaborator.name,
        description: collaborator.job_title,
      }));
    },
    [userId],
  );

  const schema = useMemo(() => createUserFormSchema(isEditing), [isEditing]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      job_title: "",
      hired_at: "",
      manager_id: null,
      salary: 0,
      email: "",
      password: "",
      role_ids: [],
    } satisfies UserFormValues,
  });

  useEffect(() => {
    if (!isEditing || !userQuery.data) {
      return;
    }

    reset({
      name: userQuery.data.name,
      job_title: userQuery.data.job_title,
      hired_at: toInputDate(userQuery.data.hired_at),
      manager_id: userQuery.data.manager_id,
      salary: Number(userQuery.data.salary),
      email: userQuery.data.email,
      password: "",
      role_ids: userQuery.data.roles?.map((role) => role.id) ?? [],
    });
  }, [isEditing, userQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const payload = {
        name: values.name,
        job_title: values.job_title,
        hired_at: values.hired_at,
        manager_id: values.manager_id,
        email: values.email,
        role_ids: values.role_ids,
      };

      if (isEditing && userId) {
        return aclService.updateUser(userId, {
          ...payload,
          password: values.password || undefined,
        });
      }

      return aclService.createUser({
        ...payload,
        salary: values.salary ?? 0,
        password: values.password!,
      });
    },
    onSuccess: async (savedUser) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate(`/users/${savedUser.id}`);
    },
    onError: (error) => {
      setFormError(null);

      if (error instanceof ApiError) {
        const message = applyApiErrors(
          error,
          setError,
          "Não foi possível salvar o colaborador.",
        );
        if (message) {
          setFormError(message);
        }
        return;
      }

      setFormError("Não foi possível salvar o colaborador.");
    },
  });

  const roleOptions = useMemo(
    () =>
      (rolesQuery.data?.data ?? []).map((role) => ({
        value: role.id,
        label: role.name,
        description: role.description ?? undefined,
      })),
    [rolesQuery.data],
  );

  const selectedManager = useMemo(() => {
    if (!userQuery.data?.manager) {
      return null;
    }

    return {
      value: userQuery.data.manager.id,
      label: userQuery.data.manager.name,
      description: userQuery.data.manager.job_title,
    };
  }, [userQuery.data?.manager]);

  if (isEditing && userQuery.isLoading) {
    return (
      <p className="text-sm text-foreground-muted">Carregando colaborador...</p>
    );
  }

  if (isEditing && userQuery.isError) {
    return (
      <div className="space-y-4">
        <Alert variant="danger">Colaborador não encontrado.</Alert>
        <Link to="/users" className="text-sm text-primary hover:underline">
          Voltar para colaboradores
        </Link>
      </div>
    );
  }

  if (id && Number.isNaN(userId)) {
    return <Navigate to="/users" replace />;
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? "Editar colaborador" : "Novo colaborador"}
        description={
          isEditing
            ? "Atualize os dados do colaborador e o acesso ao sistema."
            : "Cadastre um novo colaborador com dados completos e acesso ao sistema."
        }
      />

      <Card className="p-6">
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          noValidate
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nome"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Cargo"
              error={errors.job_title?.message}
              {...register("job_title")}
            />
            <Controller
              name="hired_at"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Contratação"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.hired_at?.message}
                />
              )}
            />
            {!isEditing && (
              <Input
                label="Remuneração"
                type="number"
                min="0"
                step="0.01"
                error={errors.salary?.message}
                {...register("salary", { valueAsNumber: true })}
              />
            )}
          </div>

          {!isEditing && (
            <p className="text-sm text-foreground-muted">
              O salário inicial será registrado automaticamente no histórico
              salarial.
            </p>
          )}

          {isEditing && userQuery.data && (
            <div className="rounded-lg border border-surface-sunken bg-surface-sunken/30 px-4 py-3">
              <p className="text-sm text-foreground-muted">
                Remuneração atual:{" "}
                <span className="font-semibold text-foreground">
                  {formatSalary(userQuery.data.salary)}
                </span>
              </p>
              <p className="mt-1 text-xs text-foreground-subtle">
                Para alterar a remuneração, registre um reajuste no histórico
                abaixo.
              </p>
            </div>
          )}

          <Controller
            name="manager_id"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="Gestor"
                value={field.value}
                onChange={field.onChange}
                onSearch={searchManagers}
                selectedOption={selectedManager}
                placeholder="Selecione o gestor"
                searchPlaceholder="Buscar colaborador..."
                emptyMessage="Digite para buscar colaboradores."
                noResultsMessage="Nenhum colaborador encontrado."
                clearLabel="Sem gestor"
                error={errors.manager_id?.message}
              />
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label={isEditing ? "Nova senha (opcional)" : "Senha"}
              type="password"
              autoComplete={isEditing ? "new-password" : "new-password"}
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <Controller
            name="role_ids"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Perfis"
                options={roleOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecione os perfis"
                searchPlaceholder="Buscar perfil..."
                error={errors.role_ids?.message}
              />
            )}
          />

          {formError && <Alert variant="danger">{formError}</Alert>}

          <FormActions
            cancelHref="/users"
            isSubmitting={isSubmitting || saveMutation.isPending}
          />
        </form>
      </Card>

      {isEditing && userId && userQuery.data && (
        <Card className="mt-4 p-6">
          <UserSalaryHistorySection
            userId={userId}
            currentSalary={userQuery.data.salary}
          />
        </Card>
      )}

      {isEditing && userId && userQuery.data && (
        <Card className="mt-4 p-6">
          <UserVacationSection userId={userId} />
        </Card>
      )}
    </div>
  );
}
